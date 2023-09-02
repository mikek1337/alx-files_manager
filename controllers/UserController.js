import sha1 from "sha1";
import { ObjectID } from "mongodb";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class UserController {
  // eslint-disable-next-line consistent-return
  static postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: "Missing email" });
    if (!password) return res.status(400).send({ error: "Missing password" });
    // eslint-disable-next-line consistent-return
    dbClient.doesUserExist({ email }).then((user) => {
      console.log(user);
      if (user) return res.status(400).send({ error: "Already exist" });
      const hasedPassword = sha1(password);
      dbClient
        .createUser({ email, password: hasedPassword })
        .then((user) => res.status(201).send({ id: user.insertedId, email }));
    });
  }
  static async getMe(req, res) {
    const token = req.header("X-Token");
    const key = `auth_${token}`;
    const data = await redisClient.get(key);
    if (data) {
      const objID = new ObjectID(data);
      console.log(objID);
      dbClient.findOne({ _id: objID }).then((user) => {
        if (user) {
          const { _id, email } = user;
          res.json({ id: _id, email });
        } else {
          res.status(401).json({ error: "Unauthorized" });
        }
      });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  }
}

export default UserController;
