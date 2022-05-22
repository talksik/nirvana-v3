import { Line, LineMember } from './line.model';

import AudioClip from './audioClip.model';
import { ObjectId } from 'mongodb';
import { User } from './user.model';

// why do we have separate full objects being sent?
// speed...I'm developing full stack and I just want all of the data and don't want to change this model
// repeatedly and trace data back and forth
export default class MasterLineData {
  // NOTE: these properties should be kept optional cuzz default values won't show up for
  // all clients who are casting response objects

  // not really necessary, but clients can know all connected folks
  //     -> if they wanted to get the feeling of people being right there
  connectedMemberIds?: string[];

  // all of the current session tuned in folks for user to see
  //     -> use as source of truth whether or not I am tuned in or not for UI to avoid confusion
  //     ->
  tunedInMemberIds?: string[];

  // list of user Ids of everyone who is buzzing in this line
  //     -> all connected line members be able to show this in the right activity section of the lineRow
  currentBroadcastersUserIds?: string[];

  profilePictures?: {
    allMembers: string[];
    allMembersWithoutMe: string[];

    untunedMembers: string[];

    tunedMembers: string[];
    broadcastMembers: string[];
  } = undefined;
  isUserTunedIn: boolean = false;
  isUserToggleTuned: boolean = false;

  constructor(
    // full line object
    public lineDetails: Line,

    // requesting user's association to the line
    public currentUserMember: LineMember,

    // all other members in the convo as well as their user object to see the member details
    public otherMembers?: LineMember[],

    public otherUserObjects?: User[] /**public audioClips: AudioClip[] = [], // public media: Media[]  */,
  ) {}
}
