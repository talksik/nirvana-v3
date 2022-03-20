import { Db, ObjectId } from "mongodb";
import Relationship, {
  RelationshipState,
} from "@nirvana/core/models/relationship.model";

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
        { senderUserId: otherGoogleUserId },
        { receiverUserId: myGoogleUserId },
      ],
    };

    const query = { $or: [clauseOne, clauseTwo] };
    const res = await collections.relationships?.findOne(query);

    // exists
    if (res?._id) {
      return res as Relationship;
    }

    return null;
  }

  static async createRelationship(newRelationship: Relationship) {
    // i am the sender and they are the receiver
    const relationshipRes = await this.getRelationship(
      newRelationship.senderUserId,
      newRelationship.receiverUserId
    );

    if (relationshipRes) {
      throw new Error("Already exists");
    }

    const insertResult = await collections.relationships?.insertOne(
      newRelationship
    );

    return insertResult;
  }

  static async updateRelationshipState(
    relationshipId: ObjectId,
    newState: RelationshipState
  ) {
    const query = { _id: new ObjectId(relationshipId) };
    console.log(newState);
    console.log(relationshipId);
    const updateDoc = {
      $set: { state: newState, lastUpdatedDate: new Date() },
    };
    const result = await collections.relationships?.updateOne(query, updateDoc);

    return result;
  }
}
