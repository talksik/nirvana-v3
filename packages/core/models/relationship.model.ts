import { ObjectId } from "mongodb";

// some sort of contact or friend model

export default class Relationship {
  constructor(
    public senderUserId: string, // sender as the one to initiate the relationship
    public receiverUserId: string,
    public state: RelationshipState,
    public createdDate: Date = new Date(),
    public lastUpdatedDate: Date = new Date(),

    public _id?: ObjectId
  ) {}
}

export enum RelationshipState {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DENIED = "DENIED",
}
