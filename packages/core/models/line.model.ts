import { ObjectId } from "mongodb";

export class Line {
  constructor(
    public _id?: ObjectId,
    public createdDate: Date = new Date(),
    public lastUpdatedDate: Date = new Date(),
    public name?: string
  ) {}
}

export class LineMember {
  // the last time that the user visited the line
  // for new activity monitoring
  lastVisitDate?: Date;

  constructor(
    // unique constraint
    public lineId: ObjectId,
    public userId: ObjectId,

    public state: LineMemberState = LineMemberState.INBOX,

    public createdDate: Date = new Date(),
    public _id?: ObjectId
  ) {}
}

export enum LineMemberState {
  // these states will be for later when we want an inbox and such
  // INVITED = "INVITED", // user gets this in their request inbox

  // ARCHIVED = "ARCHIVED", // user no longer wants anything to do with convo

  INBOX = "INBOX", // user decided to join this conversation after being invited...for now things just land in inbox anyway
  TUNED = "TUNED", // user upgraded priority of this and now is toggle tuned in live to convo
}
