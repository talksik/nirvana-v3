import User from './user.model';

export default class Conversation {
  constructor(
    public createdByUserId: string,

    public memberIdsList: string[],

    public members: ConversationMember[],

    public userCache: User[],

    public name: string | null = null,

    public lastUpdatedDate = new Date(),

    public createdDate = new Date(),

    public membersInRoom: string[] = [],

    public id?: string,
  ) {}
}

export class ConversationMember {
  constructor(
    public userId: string, // NOTE: serves as the user ID

    public role: MemberRole,
    public memberState: MemberState,

    public joinedDate = new Date(),
    public lastActiveDate?: Date, // when I last spoke in the conversation or contributed with some content
    public lastVisitDate?: Date, // when I last clicked into a conversation
    public lastFetchDate?: Date, // for the use of long polling in the future
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
