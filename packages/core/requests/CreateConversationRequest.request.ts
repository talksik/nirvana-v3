import Conversation from '@nirvana/core/models/conversation.model';
import { ObjectId } from 'mongodb';
import User from '../models/user.model';

export default class CreateConversationRequest {
  constructor(public otherUsers: User[], public conversationName?: string) {}
}
