import Conversation from '@nirvana/core/models/conversation.model';

export default class CreateConversationRequest {
  constructor(public conversation: Conversation) {}
}
