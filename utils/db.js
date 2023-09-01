import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const url = `mongodb://${process.env.DB_HOST || 'localhost'}:${
      process.env.DB_PORT || 27017
    }/${process.env.DB_DATABASE || 'files_manager'}`;
    this.dbConn = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    this.dbConn.connect();
  }

  isAlive() {
    return this.dbConn.isConnected();
  }

  async nbUsers() {
    const users = this.dbConn.db().collection('users');
    return users.countDocuments();
  }

  async nbFiles() {
    const files = this.dbConn.db().collection('files');
    return files.countDocuments();
  }

  async findUser(user) {
    const users = this.dbConn.db().collection('users');
    return users.findOne(user);
  }

  async createUser(user) {
    const users = this.dbConn.db().collection('users');
    return users.insertOne(user);
  }

  async doesUserExist(user) {
    return await this.findUser(user).toArray().length > 0;
  }
}

const dbClient = new DBClient();

export default dbClient;
