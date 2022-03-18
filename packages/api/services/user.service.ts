import { GoogleUserInfo, User } from "@nirvana/core/models";

import { ObjectId } from "mongodb";
import axios from "axios";
import { collections } from "./database.service";

export class UserService {
  static async getUserById(userId: string) {
    const query = { _id: new ObjectId(userId) };

    return (await collections.users?.findOne(query)) as unknown as User;
  }

  static async createUserIfNotExists(newUser: User) {
    return await collections.users?.insertOne(newUser);
  }

  static async getGoogleUserInfoWithAccessToken(
    accessToken: string
  ): Promise<GoogleUserInfo> {
    return await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
    );
  }
}
