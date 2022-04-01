import { ObjectId } from "mongodb";

export interface IUser {
  googleId: string; // our Google id that every google user has unique that we are going to use for now
  email: string;
  verifiedEmail: boolean;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  locale: string;

  // additional properties specific to our users collection

  createdDate: Date;
  status: UserStatus;
  lastUpdatedDate?: Date;
  _id?: ObjectId;
}

export class User implements IUser {
  constructor(
    public googleId: string, // our Google id that every google user has unique that we are going to use for now
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public givenName: string,
    public familyName: string,
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
