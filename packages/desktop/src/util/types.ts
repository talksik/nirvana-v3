import { ContentBlock } from '@nirvana/core/models/content.model';
import Conversation from '@nirvana/core/models/conversation.model';
import User from '@nirvana/core/models/user.model';

export type ConversationMap = {
  [conversationId: string]: Conversation & { tunedInUsers: string[]; connectedUserIds: string[] };
};

export type UserMap = {
  [userId: string]: User;
};

export type ConversationContentMap = {
  [conversationId: string]: ContentBlock[];
};
