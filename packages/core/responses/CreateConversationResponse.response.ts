import { ObjectId } from 'mongodb';

export default class CreateConversationResponse {
  constructor(public conversationId: ObjectId) {}
}
