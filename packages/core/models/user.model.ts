import { ObjectId } from "mongodb";

export class User {
  constructor(
    public googleId: string, // our Google id that every google user has unique that we are going to use for now
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public given_name: string,
    public family_name: string,
    public picture: string,
    public locale: string,

    // additional properties specific to our users collection

    public createdDate: Date,
    public status: UserStatus,
    public lastUpdatedDate?: Date,
    public _id?: ObjectId
  ) {}
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  FLOW_STATE = "FLOW_STATE",
}
