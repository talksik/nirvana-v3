import AudioClip from "./audioClip.model";
import { LineMember } from "./line.model";
import { ObjectId } from "mongodb";

export default class MasterLineData {
  constructor(
    // attributes of conversation
    public id: ObjectId, // id of the conversation

    public createdDate: Date,
    public lastUpdatedDate: Date,

    // compiled data for easy client read
    public currentUserMember?: LineMember,

    public otherMembers?: LineMember[],

    public audioClips: AudioClip[] = [],

    public name?: string
  ) {}
}
