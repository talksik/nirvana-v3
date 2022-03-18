import { ObjectId } from "mongodb";

export class User {
  constructor(
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public given_name: string,
    public family_name: string,
    public picture: string,
    public locale: string,
    public _id?: ObjectId // additional properties specific to our users collection
  ) {}
}
