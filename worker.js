import Queue from "bull";
import dbClient from "./utils/db";
import { ObjectId } from "mongodb";
import imageThumbnail from "image-thumbnail";
import fs from "fs";

const fileQueue = new Queue("fileQueue", "redis://127.0.0.1:6379");

fileQueue.process(async (job, done) => {
  console.log(job.data);
  if (!job.userId) return new Error("Missing userId");
  if (!job.fileId) return new Error("Missing fileId");
  const fileObjId = ObjectId(job.fileId);
  dbClient
    .db()
    .collection("files")
    .findOne({
      _id: fileObjId,
      userId: job.userId,
    })
    .then(async (file) => {
      if (!file) return new Error("File not found");
      const thumbnail1 = await imageThumbnail(file.localPath, { width: 500 });
      const thumbnail2 = await imageThumbnail(file.localPath, { width: 250 });
      const thumbnail3 = await imageThumbnail(file.localPath, { width: 100 });
      fs.writeFile(`${file.localPath}_500`, thumbnail1);
      fs.writeFile(`${file.localPath}_250`, thumbnail2);
      fs.writeFile(`${file.localPath}_100`, thumbnail3);
      done();
    })
    .catch((err) => {
      done(err);
    });
});

export default fileQueue;
