import Conversation, { ConversationMember } from '@nirvana/core/models/conversation.model';

import { ContentBlock } from '@nirvana/core/models/content.model';
import Peer from 'simple-peer';
import User from '@nirvana/core/models/user.model';

export type MasterConversation = Conversation & {
  tunedInUsers: string[];
  connectedUserIds: string[];

  // allows client side to have this pushed up in the list and can uncheck it once user is done with this
  // if action is take, normal ordering should take place with database upserts
  temporaryOverrideSort?: boolean;

  room?: {
    [userId: string]: {
      peer: Peer;
      stream?: MediaStream;
      audioTrack?: MediaStreamTrack;
      videoTrack?: MediaStreamTrack;
      screenTrack?: MediaStreamTrack;

      // calling happening whether it is a newbie or master
      isConnecting?: boolean;
    };
  };

  // all of audio clips, links, media, etc.
  content?: ContentBlock[];
};

export type ConversationMap = {
  [conversationId: string]: MasterConversation;
};

export type UserMap = {
  [userId: string]: User;
};

export type ConversationContentMap = {
  [conversationId: string]: ContentBlock[];
};
