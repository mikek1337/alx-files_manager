import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static getConnect(req, res) {
    const authheader = req.header('Authorization');

    // eslint-disable-next-line new-cap
    const auth = new Buffer.from(authheader.split(' ')[1], 'base64')
      .toString()
      .split(':');

    // if (auth.length != 2) res.status(401);
    const email = auth[0];
    const password = auth[1];
    dbClient.findUser(email).then((user) => {
      if (user === undefined || user === null) return res.status(401).json({ error: 'Unauthorized' });
      if (sha1(password) !== user.password) return res.status(401).json({ error: 'Unauthorized' });
      const randomString = uuidv4();
      const key = `auth_${randomString}`;
      redisClient.set(key, user._id.toString(), 60 * 60 * 24);
      return res.status(200).json({ token: randomString });
    });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const data = await redisClient.get(key);
    if (data) {
      await redisClient.del(key);
      res.status(204).send({});
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
