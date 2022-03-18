import { ObjectId } from "mongodb";

export class User {
  constructor(
    public _id: ObjectId,
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public given_name: string,
    public family_name: string,
    public picture: string,
    public locale: string
  ) // additional properties specific to our users collection
  {}
}
