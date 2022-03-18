import { GoogleUserInfo, User } from "@nirvana/core/models";

import { ObjectId } from "mongodb";
import axios from "axios";
import { collections } from "./database.service";

export class UserService {
  static async getUserById(userId: string) {
    const query = { _id: new ObjectId(userId) };

    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as User;
    }

    return null;
  }

  static async getUserByEmail(email: string) {
    const query = { email };

    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as User;
    }

    return null;
  }

  static async getUsersLikeEmailAndName(searchQuery: string) {
    // based on index defined in Mongo atlas
    const query = {
      $search: {
        index: "default",
        text: {
          query: searchQuery,
          path: {
            wildcard: "*",
          },
        },
      },
    };

    // const res = await collections.users?.find(query).toArray();

    const res = await collections.users?.aggregate([query]).toArray();

    // exists
    if (res?.length) {
      return res as User[];
    }

    return null;
  }

  static async createUserIfNotExists(newUser: User) {
    const exists = (await collections.users?.findOne({ email: newUser.email }))
      ?._id;

    if (!exists) {
      return await collections.users?.insertOne(newUser);
    }

    // user with email exists already, don't create
    return null;
  }

  static async getGoogleUserInfoWithAccessToken(
    accessToken: string
  ): Promise<GoogleUserInfo> {
    return (
      await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
      )
    ).data;
  }
}
