import Conversation from '@nirvana/core/models/conversation.model';
import { ObjectId } from 'mongodb';

export default class CreateConversationRequest {
  constructor(public otherMemberIds: ObjectId[], public conversationName?: string) {}
}
