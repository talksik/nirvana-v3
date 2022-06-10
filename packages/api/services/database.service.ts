// External Dependencies
import * as mongoDB from 'mongodb';

import environmentVariables from '../config/config';

// Global Variables
export const collections: {
  users?: mongoDB.Collection;
} = {};

// Initialize Connection

export const client: mongoDB.MongoClient = new mongoDB.MongoClient(
  environmentVariables.MONGO_CONNECTION_STRING,
);

client.connect();

const db: mongoDB.Db = client.db(process.env.DB_NAME);

const usersCollection: mongoDB.Collection = db.collection('users');

// client.on('connection', () => {
//   db.command({
//     collMod: 'lines',
//   });
// });

collections.users = usersCollection;

console.log(`Successfully connected to database: ${db.databaseName} and collections`);
