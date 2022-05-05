import { Line, LineMember } from "./line.model";

import AudioClip from "./audioClip.model";
import { ObjectId } from "mongodb";
import { User } from "./user.model";

// why do we have separate full objects being sent?
// speed...I'm developing full stack and I just want all of the data and don't want to change this model
// repeatedly and trace data back and forth
export default class MasterLineData {
  constructor(
    // full line object
    public lineDetails: Line,

    // requesting user's association to the line
    public currentUserMember: LineMember,

    // all other members in the convo as well as their user object to see the member details
    public otherMembers?: LineMember[],

    public otherUserObjects?: User[] /**public audioClips: AudioClip[] = [], // public media: Media[]  */
  ) {}
}