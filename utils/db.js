import { MongoClient } from "mongodb";
class DBClient {
  constructor() {
    let url = `mongodb://${process.env.DB_HOST || "localhost"}:${
      process.env.DB_PORT || 27017
    }/${process.env.DB_DATABASE || "files_manager"}`;
    this.dbConn = new MongoClient(url);
    this.dbConn.connect();
  }

  isAlive() {
    return this.dbConn.isConnected();
  }

  async nbUsers() {
    return await this.dbConn.users.find().toArray().length;
  }

  async nbFiles(){
    return await files.find().toArray().length;
  }
}

const dbClient = new DBClient();

export default dbClient;
