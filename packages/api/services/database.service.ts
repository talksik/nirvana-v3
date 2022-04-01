// External Dependencies
import * as mongoDB from "mongodb";

import { loadConfig } from "../config";

// Global Variables
export const collections: {
  users?: mongoDB.Collection;
} = {};

// Initialize Connection
export async function connectToDatabase() {
  const config = loadConfig();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    config.MONGO_CONNECTION_STRING
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  const usersCollection: mongoDB.Collection = db.collection("users");

  collections.users = usersCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collections`
  );
}
