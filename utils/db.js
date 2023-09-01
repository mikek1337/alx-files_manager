import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const url = `mongodb://${process.env.DB_HOST || 'localhost'}:${
      process.env.DB_PORT || 27017
    }/${process.env.DB_DATABASE || 'files_manager'}`;
    this.dbConn = new MongoClient(url);
    this.dbConn.connect();
  }

  isAlive() {
    return this.dbConn.isConnected();
  }

  async nbUsers() {
    const users = this.dbConn.db().collection('users');
    return users.find().toArray().length;
  }

  async nbFiles() {
    const files = this.dbConn.db().collection('files');
    return files.find().toArray().length;
  }
}

const dbClient = new DBClient();

export default dbClient;
