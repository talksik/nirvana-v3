import { GoogleUserInfo } from "./googleUserInfo.model";
import { ObjectId } from "mongodb";

export class User extends GoogleUserInfo {
  constructor(
    id: ObjectId,
    email: string,
    verifiedEmail: boolean,
    name: string,
    given_name: string,
    family_name: string,
    picture: string,
    locale: string,

    // additional properties specific to our users collection
    mongoId: ObjectId
  ) {
    super(
      id,
      email,
      verifiedEmail,
      name,
      given_name,
      family_name,
      picture,
      locale
    );
  }
}
