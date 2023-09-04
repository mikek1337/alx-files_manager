import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.connected = false;
    this.redis = createClient();
    this.redis.on('error', (err) => {
      console.log(err);
    });
    this.redis.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    return promisify(this.redis.get).bind(this.redis)(key);
  }

  async set(key, value, duration) {
    this.redis.set(key, value, () => {});
    this.redis.expire(key, duration);
  }

  async del(key) {
    return promisify(this.redis.del).bind(this.redis)(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
