import Relationship from "../models/relationship.model";
import { User } from "../models/user.model";

export default class GetContactsResponse {
  contactsDetails: ContactDetails[] = [];

  constructor() {}
}

export class ContactDetails {
  isSpeaking: boolean = false;

  constructor(public otherUser: User, public relationship: Relationship) {}
}
