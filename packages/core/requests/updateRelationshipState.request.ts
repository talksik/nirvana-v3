import { ObjectId } from "mongodb";
import { RelationshipState } from "../models/relationship.model";

export default class UpdateRelationshipStateRequest {
  constructor(
    public relationshipId: ObjectId,
    public newState: RelationshipState
  ) {}
}
