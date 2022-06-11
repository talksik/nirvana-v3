import { ObjectId } from 'mongodb';
import User from './user.model';

export default class Conversation {
  constructor(
    public createdByUserId: string,

    /**
     * includes basic user info as well as their information
     * for this particular conversation
     */
    public members: ConversationUserMember[],

    public name?: string,

    public id: ObjectId = new ObjectId(),

    /**
     * last time there was new content for everyone
     */
    public lastActivityDate = new Date(),

    /**
     * when the conversation document was created
     */
    public createdDate = new Date(),

    /**
     * when name was changed or member list updated
     */
    public lastUpdatedDate?: Date,
  ) {}
}

export type ConversationUserMember = ConversationMember & User;

export class ConversationMember {
  constructor(
    public role: MemberRole,
    public memberState: MemberState,

    public joinedDate = new Date(),

    /**
     * when I last spoke in the conversation or contributed to a conversation
     */
    public lastActiveDate?: Date,

    /**
     * last time I clicked into a conversation
     */
    public lastVisitDate?: Date,

    /**
     * when this conversation was last brought to my attention/displayed
     * for the use of long polling in the future
     */
    public lastFetchDate?: Date,
  ) {}
}

export enum MemberRole {
  admin = 'admin',
  regular = 'regular',
}
export enum MemberState {
  priority = 'priority',
  inbox = 'inbox',
  // deleted = "deleted"
}
