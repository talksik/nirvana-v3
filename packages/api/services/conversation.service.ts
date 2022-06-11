import Conversation from '@nirvana/core/models/conversation.model';
import { ObjectId } from 'mongodb';
import { collections } from './database.service';

export default class ConversationService {
  static async createConversation(newConversation: Conversation) {
    return await collections.conversations?.insertOne(newConversation);
  }

  static async getAllConversationsForUser(userId: string) {
    const query = { 'members._id': new ObjectId(userId) };

    const res = await collections.conversations?.find(query).toArray();

    // exists
    if (res?.length) {
      return res as Conversation[];
    }

    return undefined;
  }
}
