import { Line, LineMember } from "@nirvana/core/models/line.model";
import { client, collections } from "./database.service";

import { ObjectId } from "mongodb";

export class LineService {
  static async getLineByOtherUserId(otherUserId: ObjectId) {
    // get all of the conversations for this user that have exactly two conversation members
    // get all of the conversationMembers for this user
    // get all of the conversations for this user
    // get all of the conversations
    // const query = { googleId: userId };
    // const res = await collections.users?.findOne(query);
    // // exists
    // if (res?._id) {
    //   return res as User;
    // }
    // return null;
  }

  static async getLinesByIds(convoIds: ObjectId[]) {
    const query = { _id: { $in: convoIds } };

    const convosRes = await collections.lines?.find(query).toArray();

    // exists
    if (convosRes?.length) {
      return convosRes as Line[];
    }

    return null;
  }

  static async getLineMembersByUserId(userId: string) {
    const query = { userId: new ObjectId(userId) };

    const convoMembersRes = await collections.lineMembers
      ?.find(query)
      .toArray();

    // exists
    if (convoMembersRes?.length) {
      return convoMembersRes as LineMember[];
    }

    return null;
  }

  static async createLine(line: Line, lineMembers: LineMember[]) {
    const session = client.startSession();
    try {
      const transactionResults = await session.withTransaction(async () => {
        // todo: check if convoMembers userId's actually exist

        const insertLineRes = await collections.lines?.insertOne(line);
        if (!insertLineRes?.insertedId) {
          await session.abortTransaction();
          console.error("failed to create line");

          return;
        }

        const insertConvoMembersRes = await collections.lineMembers?.insertMany(
          lineMembers
        );
        if (!insertConvoMembersRes?.insertedCount) {
          await session.abortTransaction();
          console.error("failed to create line members");

          return;
        }

        console.log("success");
        return insertConvoMembersRes;
      });

      console.log(transactionResults);

      return "success";

      // if (transactionResults) {
      //   console.log("The convo was successfully created.");
      //   return transactionResults;
      // } else {
      //   console.log("The convo was intentionally aborted.");
      //   return null;
      // }
    } catch (e) {
      console.log(
        "The transaction was aborted due to an unexpected error: " + e
      );
    } finally {
      await session.endSession();
    }

    return null;
  }
}
