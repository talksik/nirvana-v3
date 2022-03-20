import Content from "../models/content.model";
import Relationship from "../models/relationship.model";
import { User } from "@nirvana/core/models";

export default class GetConversationDetailsResponse {
  // get the messages for this conversation for like last 7 days or just a count of them until we paginate?

  constructor(
    public contactUser: User,
    public isLiveOrPinned: boolean,
    public ourRelationship?: Relationship,
    public latestContent?: Content[]
  ) {}
}
