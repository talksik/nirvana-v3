import { Conversation } from "../models/conversation.model";

export default class GetDmConversationByOtherUserIdResponse {
  constructor(public conversation: Conversation) {}
}
