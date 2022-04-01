import GoogleUserInfo from "../../core/models/googleUserInfo.model";
import { ObjectId } from "mongodb";
import { User } from "@nirvana/core/models/user.model";
import { UserModel } from "./database.service";
import { UserStatus } from "../../core/models/user.model";
import axios from "axios";

export class UserService {
  static async getUserByEmail(email: string) {
    const res = await UserModel.findOne({ email });

    // exists
    if (!res?.$isEmpty) {
      return res;
    }

    return null;
  }

  // static async getUsersLikeEmailAndName(searchQuery: string) {
  //   // based on index defined in Mongo atlas
  //   const query = {
  //     $search: {
  //       index: "default",
  //       text: {
  //         query: searchQuery,
  //         path: {
  //           wildcard: "*",
  //         },
  //       },
  //     },
  //   };

  //   // const res = await collections.users?.find(query).toArray();

  //   const res = await collections.users?.aggregate([query]).toArray();

  //   // exists
  //   if (res?.length) {
  //     return res as User[];
  //   }

  //   return null;
  // }

  static async createUserIfNotExists(newUser: User) {
    const getUser = await this.getUserByEmail(newUser.email);

    if (!getUser) {
      const newUser = new UserModel(User);
      newUser.isNew = true;

      return newUser.save();
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

  // static async updateUserStatus(userId: string, newStatus: UserStatus) {
  //   const query = { googleId: userGoogleId };
  //   const updateDoc = {
  //     $set: { status: newStatus, lastUpdatedDate: new Date() },
  //   };

  //   const resultUpdate = UserModel.findByIdAndUpdate

  //   return resultUpdate;
  // }
}
