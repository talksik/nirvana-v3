import { Conversation } from "../models/conversation.model";

export default class GetUserConversationsResponse {
  constructor(public convos: Conversation[]) {}
}
