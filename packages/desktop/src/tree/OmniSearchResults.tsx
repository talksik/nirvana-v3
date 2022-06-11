import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';

import Conversation from '@nirvana/core/models/conversation.model';
import { ConversationRow } from './ConversationList';
import { FiZap } from 'react-icons/fi';
import User from '@nirvana/core/models/user.model';
import useConversations from '../providers/ConversationProvider';
import useSearch from '../providers/SearchProvider';
import useTerminal from './Terminal';

export default function OmniSearchResults() {
  const { handleStartConversation } = useConversations();

  const { userResults: people, conversationResults: conversations, clearSearch } = useSearch();

  const handleQuickDial = useCallback(
    async (otherUser: User) => {
      const succeededDialed = await handleStartConversation([otherUser]);

      if (succeededDialed) {
        clearSearch();
      }
    },
    [handleStartConversation, clearSearch],
  );

  return (
    <>
      <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography align={'center'} variant="subtitle2">
              People
            </Typography>
          </ListSubheader>
        }
      >
        <ListItem
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {people.length === 0 && (
            <Typography align="center" variant="caption">
              {`Can't find someone? Invite them!`}
            </Typography>
          )}
        </ListItem>

        {people.map((person) => (
          <Tooltip key={`${person._id.toString()}-searchUsers`} title={'quick dial'}>
            <ListItem>
              <ListItemButton onClick={() => handleQuickDial(person)}>
                <ListItemAvatar>
                  <Avatar alt={person.givenName} src={person.picture} />
                </ListItemAvatar>

                <ListItemText primary={person.name} secondary={person.email} />

                <ListItemSecondaryAction sx={{ color: 'GrayText' }}>
                  <FiZap />
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography align={'center'} variant="subtitle2">
              Conversations
            </Typography>
          </ListSubheader>
        }
      >
        <ListItem
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {conversations.length === 0 && (
            <Typography align="center" variant="caption">
              {`Can't find a conversation? Just create one!`}
            </Typography>
          )}
        </ListItem>

        {conversations.map((conversation) => (
          <Tooltip
            key={`tooltip-${conversation._id.toString()}-searchConversations`}
            title={'continue conversation'}
          >
            <ConversationRow conversation={conversation} onClick={clearSearch} />
          </Tooltip>
        ))}
      </List>
    </>
  );
}
