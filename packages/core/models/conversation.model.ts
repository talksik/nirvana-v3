import { ObjectId } from "mongodb";

export class Conversation {
  name?: string;

  constructor(
    public _id?: ObjectId,
    public createdDate: Date = new Date(),
    public lastUpdatedDate: Date = new Date()
  ) {}
}

export class ConversationMember {
  constructor(
    // unique constraint
    public conversationId: ObjectId,
    public userId: ObjectId,

    public state: ConversationMemberState = ConversationMemberState.INVITED,

    public createdDate: Date = new Date(),
    public _id?: ObjectId
  ) {}
}

export enum ConversationMemberState {
  INVITED = "INVITED", // user gets this in their request inbox
  INBOX = "INBOX", // user decided to join this conversation after being invited
  TUNED = "TUNED", // user upgraded priority of this and now is tuned in live to convo
  ARCHIVED = "ARCHIVED", // user no longer wants anything to do with convo
}
