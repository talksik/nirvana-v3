import { ContentBlock } from '@nirvana/core/models/content.model';
import Conversation from '@nirvana/core/models/conversation.model';
import User from '@nirvana/core/models/user.model';

export type MasterConversation = Conversation & {
  tunedInUsers: string[];
  connectedUserIds: string[];

  // allows client side to have this pushed up in the list and can uncheck it once user is done with this
  // if action is take, normal ordering should take place with database upserts
  temporaryOverrideSort?: boolean;
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
