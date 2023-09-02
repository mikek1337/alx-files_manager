import { MongoClient } from "mongodb";

class DBClient {
  constructor() {
    const url = `mongodb://${process.env.DB_HOST || "localhost"}:${
      process.env.DB_PORT || 27017
    }/${process.env.DB_DATABASE || "files_manager"}`;
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
    const users = this.dbConn.db().collection("users");
    return users.countDocuments();
  }

  async nbFiles() {
    const files = this.dbConn.db().collection("files");
    return files.countDocuments();
  }

  async findUser(email) {
    const users = this.dbConn.db().collection("users");
    return users.findOne({ email: email });
  }

  async findOne(data){
    const user = this.dbConn.db().collection("users");
    return await user.findOne(data);
  }

  async createUser(user) {
    const users = this.dbConn.db().collection("users");
    return users.insertOne(user);
  }

  async doesUserExist(email) {
    const user = this.dbConn.db().collection("users");
    const foundUsers = await user.find(email).toArray();

    return foundUsers.length > 0;
  }
}

const dbClient = new DBClient();

export default dbClient;
