import { ObjectId } from "mongodb";

export class User {
  constructor(
    public googleId: string, // our Google id that every google user has unique that we are going to use for now
    public email: string,

    public name: string,
    public givenName: string,
    public familyName: string,
    public createdDate: Date,
    public picture?: string,
    public verifiedEmail: boolean = false,

    public locale?: string,

    // additional properties specific to our users collection
    public status?: UserStatus,
    public lastUpdatedDate?: Date,
    public _id?: ObjectId
  ) {}
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  FLOW_STATE = "FLOW_STATE",
}
