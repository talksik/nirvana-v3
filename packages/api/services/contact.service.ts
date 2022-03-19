import Relationship from "@nirvana/core/models/relationship.model";
import { collections } from "./database.service";

export class ContactService {
  static async getRelationship(
    myGoogleUserId: string,
    otherGoogleUserId: string
  ) {
    // i am the sender and they are the receiver
    const clauseOne = {
      $and: [
        { senderUserId: myGoogleUserId },
        { receiverUserId: otherGoogleUserId },
      ],
    };
    // i could also be the receiver and them the sender
    const clauseTwo = {
      $and: [
        { senderUserId: myGoogleUserId },
        { receiverUserId: otherGoogleUserId },
      ],
    };

    const query = { $or: [clauseOne, clauseTwo] };
    const res = await collections.users?.findOne(query);

    // exists
    if (res?._id) {
      return res as Relationship;
    }

    return null;
  }
}
