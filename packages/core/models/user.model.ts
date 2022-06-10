import { ObjectId } from 'mongodb';

export default class User {
  constructor(
    public googleId: string,
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
    public _id?: ObjectId,
  ) {}
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  FLOW_STATE = 'FLOW_STATE',
}

export class GoogleUserInfo {
  constructor(
    public id: string,
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public given_name: string,
    public family_name: string,
    public picture: string,
    public locale: string,
  ) {}
}
