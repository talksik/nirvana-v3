import Conversation from '@nirvana/core/models/conversation.model';
import React from 'react';
import { Typography } from '@mui/material';
import User from '@nirvana/core/models/user.model';
import useAuth from '../providers/AuthProvider';

type IConversationLabel = (
  | {
      conversationName?: string;
      users: User[];
    }
  | {
      conversationName: string;
      users?: User[];
    }
) & { isSelected?: boolean };

/**
 * if there is a name in the conversation, then return that
 * if not, then return first three names
 */
export default function ConversationLabel({
  conversationName,
  users,
  isSelected = false,
}: IConversationLabel) {
  const { user } = useAuth();

  if (conversationName) {
    return (
      <Typography
        noWrap
        variant={'overline'}
        color={isSelected && 'primary'}
        sx={{ fontWeight: isSelected && 'bold' }}
      >
        {conversationName}
      </Typography>
    );
  }

  const filteredUsers = users.filter((convoUser) => convoUser._id !== user._id);

  if (filteredUsers.length === 1) {
    const firstName = filteredUsers[0].name;

    return (
      <Typography
        noWrap
        variant={'overline'}
        color={isSelected && 'primary'}
        sx={{ fontWeight: isSelected && 'bold' }}
      >
        {firstName}
      </Typography>
    );
  }

  if (filteredUsers.length > 1) {
    const firstNames = filteredUsers.map((filteredUser) => filteredUser.name);

    const formattedFirstnames = firstNames.slice(0, -1).join(',') + ' and ' + firstNames.slice(-1);

    return (
      <Typography
        noWrap
        variant={'overline'}
        color={isSelected && 'primary'}
        sx={{ fontWeight: isSelected && 'bold' }}
      >
        {formattedFirstnames}
      </Typography>
    );
  }

  return;
}
