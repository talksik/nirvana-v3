import AudioClip from "./audioClip.model";
import { ConversationMember } from "./conversation.model";
import { ObjectId } from "mongodb";

export default class MasterConversation {
  // attributes of conversation
  id: ObjectId; // id of the conversation
  name?: string;
  createdDate: Date;
  lastUpdatedDate: Date;

  // compiled data for easy client read
  currentUserMember: ConversationMember;
  otherMembers: ConversationMember[];

  audioClips: AudioClip[];
}
