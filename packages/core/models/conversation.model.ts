import { ObjectId } from "mongodb";

export class Conversation {
  _id: ObjectId;
  name?: string;

  createdDate: Date;
  lastUpdatedDate: Date;

  constructor() {}
}

export class ConversationMember {
  _id: ObjectId;

  // unique constraint
  conversationId: ObjectId;
  userId: ObjectId;

  state: ConversationMemberState;

  createdDate: Date;
}

export enum ConversationMemberState {
  INVITED = "INVITED", // user gets this in their request inbox
  INBOX = "INBOX", // user decided to join this conversation after being invited
  TUNED = "TUNED", // user upgraded priority of this and now is tuned in live to convo
  ARCHIVED = "ARCHIVED", // user no longer wants anything to do with convo
}
