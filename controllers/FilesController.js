import { MIMEType } from 'util';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Queue from 'bull';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FileController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    const types = ['folder', 'file', 'image'];
    const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !types.includes(type)) { return res.status(400).send({ error: 'Missing type' }); }
    if (!data && type !== 'folder') { return res.status(400).send({ error: 'Missing data' }); }

    if (parentId) {
      const parent = await dbClient.findOne({ _id: parentId });
      if (!parent) return res.status(400).send({ error: 'Parent not found' });
      if (parent.type !== 'folder') { return res.status(400).send({ error: 'Parent is not a folder' }); }
    }
    if (type === 'folder') {
      const folder = await dbClient.createFile({
        userId: userID,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
      const { _id } = folder.ops[0];
      return res
        .status(201)
        .send({
          // eslint-disable-next-line no-undef
          id: _id, userId: userID, name, type, isPublic, parentId,
        });
    // eslint-disable-next-line no-else-return
    } else {
      fs.mkdirSync(filePath, { recursive: true });
      // eslint-disable-next-line no-undef, no-use-before-define
      const isPublic = isPublic || false;
      // eslint-disable-next-line no-undef, no-use-before-define
      const parentId = parentId || 0;
      const fileData = await dbClient.createFile({
        userId: userID,
        name,
        type,
        isPublic,
        parentId,
        localPath: `${filePath}/${uuidv4()}`,
      });
      // eslint-disable-next-line new-cap
      const toWrite = new Buffer.from(data, 'base64').toString('utf-8');
      fs.writeFile(`${filePath}/${uuidv4()}`, toWrite, (err) => {
        if (err) throw err;
      });
      if (type === 'image') {
        fileQueue.add({ userId: userID, fileId: fileData.ops[0]._id });
      }

      const { _id } = fileData.ops[0];
      return res
        .status(201)
        .send({
          id: _id, userId: userID, name, type, isPublic, parentId,
        });
    }
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const file = await dbClient.findFile({ _id: id, userId: userID });
    if (!file) return res.status(404).json({ error: 'Not found' });
    return res.status(200).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  // eslint-disable-next-line consistent-return
  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const limit = 20;
    const page = req.query.page || 0;
    const parentId = req.query.parentId || 0;
    dbClient.dbConn
      .db()
      .collection('files')
      .aggregate([
        { $match: { parentId } },
        { $skip: limit * page },
        { $limit: limit },
      ])
      .toArray((err, result) => {
        if (err) throw err;
        return res.status(200).send(result);
      });
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const file = await dbClient.findFile({ _id: id, userId: userID });
    if (!file) return res.status(404).json({ error: 'Not found' });
    const updatedFile = await dbClient.updateFile(id, { isPublic: true });
    return res.status(200).send({
      id: updatedFile._id,
      userId: updatedFile.userId,
      name: updatedFile.name,
      type: updatedFile.type,
      isPublic: updatedFile.isPublic,
      parentId: updatedFile.parentId,
    });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const file = await dbClient.findFile({ _id: id, userId: userID });
    if (!file) return res.status(404).json({ error: 'Not found' });
    const updatedFile = await dbClient.updateFile(id, { isPublic: false });
    return res.status(200).send({
      id: updatedFile._id,
      userId: updatedFile.userId,
      name: updatedFile.name,
      type: updatedFile.type,
      isPublic: updatedFile.isPublic,
      parentId: updatedFile.parentId,
    });
  }

  static async getFile(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const file = await dbClient.findFile({ _id: id, userId: userID });
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (file.type === 'folder') { return res.status(400).json({ error: "A folder doesn't have content" }); }
    const filePath = file.localPath;
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const mimeType = MIMEType.lookup(filePath);
    res.setHeader('Content-Type', mimeType);
    return res.status(200).send(fileData);
  }
}

export default FileController;
