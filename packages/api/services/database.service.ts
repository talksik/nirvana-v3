// External Dependencies
import * as mongoDB from "mongodb";

import { loadConfig } from "../config";

// Global Variables
export const collections: {
  users?: mongoDB.Collection;
  conversations?: mongoDB.Collection;
  conversationMembers?: mongoDB.Collection;
  audioClips?: mongoDB.Collection;
} = {};

// Initialize Connection
const config = loadConfig();

export const client: mongoDB.MongoClient = new mongoDB.MongoClient(
  config.MONGO_CONNECTION_STRING
);

client.connect();

const db: mongoDB.Db = client.db(process.env.DB_NAME);

const usersCollection: mongoDB.Collection = db.collection("users");
const convoCollection: mongoDB.Collection = db.collection("conversations");
const convoMembersCollection: mongoDB.Collection = db.collection(
  "conversationMembers"
);
const audioClipsCollection: mongoDB.Collection = db.collection("audioClips");

collections.users = usersCollection;
collections.conversations = convoCollection;
collections.conversationMembers = convoMembersCollection;
collections.audioClips = audioClipsCollection;

console.log(
  `Successfully connected to database: ${db.databaseName} and collections`
);
