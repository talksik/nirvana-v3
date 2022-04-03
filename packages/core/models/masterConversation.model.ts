import AudioClip from "./audioClip.model";
import { ConversationMember } from "./conversation.model";
import { ObjectId } from "mongodb";

export default class MasterConversation {
  constructor(
    // attributes of conversation
    public id: ObjectId, // id of the conversation

    public createdDate: Date,
    public lastUpdatedDate: Date,

    // compiled data for easy client read
    public currentUserMember?: ConversationMember,

    public otherMembers?: ConversationMember[],

    public audioClips: AudioClip[] = [],

    public name?: string
  ) {}
}
