import Conversation from '@nirvana/core/models/conversation.model';
import { collections } from './database.service';

export default class ConversationService {
  static async createConversation(newConversation: Conversation) {
    return await collections.conversations?.insertOne(newConversation);
  }
}
