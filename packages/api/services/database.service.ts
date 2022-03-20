// External Dependencies
import * as mongoDB from "mongodb";
// import * as dotenv from "dotenv";

// Global Variables

export const collections: {
  users?: mongoDB.Collection;
  relationships?: mongoDB.Collection;
} = {};

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    "mongodb+srv://default:M9iZXokJlZpN4KLX@cluster0.mkuqa.mongodb.net/default?retryWrites=true&w=majority"
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  const usersCollection: mongoDB.Collection = db.collection("users");
  const relationshipCollection: mongoDB.Collection =
    db.collection("relationships");

  collections.users = usersCollection;
  collections.relationships = relationshipCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collections`
  );
}
