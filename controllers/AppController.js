import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getStatus = (req, res) => {
  res.status(200).send({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};

export const getStats = async (req, res) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();
  res.status(200).send({
    users,
    files,
  });
};
