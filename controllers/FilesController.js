import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
class FileController {
  static async postUpload(req, res) {
    const token = req.header("X-Token");
    const key = `auth_${token}`;
    const userID = await redisClient.get(key);
    if (!userID) return res.status(401).json({ error: "Unauthorized" });
    const { name, type, parentId, isPublic, data } = req.body;
    console.log(req.body);
    const types = ["folder", "file", "image"];
    const filePath = process.env.FOLDER_PATH || "/tmp/files_manager";
    if (!name) return res.status(400).send({ error: "Missing name" });
    if (!type || !types.includes(type))
      return res.status(400).send({ error: "Missing type" });
    if (!data && type != "folder")
      return res.status(400).send({ error: "Missing data" });

    if (parentId) {
      const parent = await dbClient.findOne({ _id: parentId });
      if (!parent) return res.status(400).send({ error: "Parent not found" });
      if (parent.type !== "folder")
        return res.status(400).send({ error: "Parent is not a folder" });
    }
    if (type === "folder") {
      const folder = await dbClient.createFile({
        userId: userID,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
      const { _id } = folder.ops[0];
      return res
        .status(201)
        .send({ id: _id, userId, name, type, isPublic, parentId });
    } else {
      fs.mkdirSync(filePath, { recursive: true });
      const isPublic = isPublic || false;
      const parentId = parentId || 0;
      const fileData = await dbClient.createFile({
        userId: userID,
        name: name,
        type: type,
        isPublic: isPublic,
        parentId: parentId,
        localPath: `${filePath}/${uuidv4()}`,
      });
      const toWrite = new Buffer.from(data, "base64").toString("utf-8");
      fs.writeFile(`${filePath}/${uuidv4()}`, toWrite, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
      });
      const { _id } = fileData.ops[0];
      return res
        .status(201)
        .send({ id: _id, userID, name, type, isPublic, parentId });
    }
  }
}

export default FileController;
