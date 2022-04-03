import {
  Conversation,
  ConversationMember,
} from "../../core/models/conversation.model";
import { client, collections } from "./database.service";

import { ObjectId } from "mongodb";

export class ConversationService {
  static async getConversationByOtherUserId(otherUserId: ObjectId) {
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

  static async createConversation(
    convo: Conversation,
    convoMembers: ConversationMember[]
  ) {
    const session = client.startSession();
    try {
      const transactionResults = await session.withTransaction(async () => {
        // todo: check if convoMembers userId's actually exist

        const insertConvoRes = await collections.conversations?.insertOne(
          convo
        );
        if (!insertConvoRes?.insertedId) {
          await session.abortTransaction();
          console.error("failed to create convo");

          return;
        }

        const insertConvoMembersRes =
          await collections.conversationMembers?.insertMany(convoMembers);
        if (!insertConvoMembersRes?.insertedCount) {
          await session.abortTransaction();
          console.error("failed to create conversation members");

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
