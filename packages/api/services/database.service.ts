// External Dependencies
import * as mongoDB from "mongodb";

import { IUser, UserStatus } from "@nirvana/core/models/user.model";

import { ObjectId } from "mongodb";
import { loadConfig } from "../config";
import mongoose from "mongoose";

connectToDatabase().catch((err) => console.log(err));

// Initialize Connection
export async function connectToDatabase() {
  const config = loadConfig();

  await mongoose.connect(config.MONGO_CONNECTION_STRING);

  console.log(`Successfully connected to mongoose/mongodb`);
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    googleId: { type: String, required: true }, // our Google id that every google user has unique that we are going to use for now
    verifiedEmail: Boolean,
    givenName: { type: String, required: true },
    familyName: { type: String, required: true },
    picture: String,
    locale: String,

    // additional properties specific to our users collection

    createdDate: Date,
    status: String,
    lastUpdatedDate: Date,
    _id: ObjectId,
  },
  { collection: "users" }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
