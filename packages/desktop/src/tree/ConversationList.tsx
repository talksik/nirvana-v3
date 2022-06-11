import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material';
import { FiActivity, FiCircle, FiSun } from 'react-icons/fi';
import React, { useCallback, useMemo } from 'react';
import { useKeyPressEvent, useRendersCount } from 'react-use';

import Conversation from '@nirvana/core/models/conversation.model';
import ConversationLabel from '../subcomponents/ConversationLabel';
import KeyboardShortcutLabel from '../subcomponents/KeyboardShortcutLabel';
import { MasterConversation } from '../util/types';
import { NirvanaRules } from '../util/rules';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import useTerminal from './Terminal';

// sort conversations based on the different data sources: type, conversations, audio clips, etc.

/**
 *
 * @param lookingForSomeone: if a conversation id has been selected and we are looking for it
 * @returns
 */
export function ConversationList() {
  // const { handleOmniSearch } = useTerminal();

  const { conversationMap } = useConversations();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION LIST | ', rendersCount);

  // don't actually dial, just show nirvana support there
  // const handleQuickDialSupport = useCallback(() => {
  //   handleOmniSearch(SUPPORT_DISPLAY_NAME);
  // }, [handleOmniSearch]);

  if (Object.keys(conversationMap).length === 0) {
    return (
      <Stack direction={'column'} alignItems="center">
        <Typography align="center" variant="caption">
          Look for someone by name or email to start a conversation!
        </Typography>

        <Divider />

        <Button variant={'text'}>Click here to say hi to our team!</Button>
      </Stack>
    );
  }

  return (
    <>
      <List
        subheader={
          <ListSubheader>
            <FiActivity />
            <Typography variant="subtitle2"> Priority</Typography>
          </ListSubheader>
        }
      >
        {Object.values(conversationMap).map((currentConversation, index) => (
          <ConversationRow
            key={`${currentConversation._id.toString()}-priorityConvoList`}
            conversation={currentConversation}
            index={index}
          />
        ))}
      </List>

      {/* <Divider /> */}

      {/* <List
        sx={{
          pt: 2,
        }}
        subheader={
          <ListSubheader>
            <FiInbox />
            <Typography variant="subtitle2"> Inbox</Typography>
          </ListSubheader>
        }
      ></List> */}
    </>
  );
}

/**
 *
 * @param index is used for keyboard shortcut if this convo row is in a list
 * @returns
 */
export function ConversationRow({
  conversation,
  index,
}: {
  conversation: MasterConversation;
  index?: number;
}) {
  const { user } = useAuth();

  const { selectedConversation, selectConversation } = useConversations();

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | CONVERSATION LIST ROW | ', rendersCount);

  const keyboardShortcut = useMemo(() => {
    if (index < NirvanaRules.topXConversationsWithShortcuts) {
      return index + 1;
    }

    return undefined;
  }, [index]);

  const handleSelectConversation = useCallback(() => {
    selectConversation(conversation._id.toString(), false);
  }, [conversation, selectConversation]);

  useKeyPressEvent(`${keyboardShortcut?.toString()}`, handleSelectConversation);

  return (
    <ListItem>
      <ListItemButton
        selected={selectedConversation?._id.toString() === conversation._id.toString()}
        onClick={handleSelectConversation}
      >
        {conversation.tunedInUsers?.length > 0 ? (
          <Box sx={{ color: 'primary.main', fontSize: 15, ml: 0 }}>
            <FiSun />
          </Box>
        ) : (
          <Box sx={{ color: 'GrayText', fontSize: 10, ml: 0 }}>
            <FiCircle />
          </Box>
        )}

        <Stack
          direction={'row'}
          spacing={1}
          sx={{ ml: 2, mr: 'auto', color: 'GrayText', overflow: 'auto' }}
        >
          {keyboardShortcut && <KeyboardShortcutLabel label={keyboardShortcut.toString()} />}

          <ConversationLabel
            users={conversation.members ?? []}
            conversationName={conversation.name}
            isSelected={selectedConversation?._id.toString() === conversation._id.toString()}
          />
        </Stack>

        <ListItemAvatar>
          <AvatarGroup variant={'rounded'}>
            {conversation.members?.map((conversationUser, index) => (
              <Avatar
                key={`${conversation._id.toString()}-${conversationUser._id.toString()}-convoIcon`}
                alt={conversationUser?.givenName}
                src={conversationUser?.picture}
                sx={{
                  width: 30,
                  height: 30,
                  opacity: conversation.tunedInUsers?.includes(conversationUser._id.toString())
                    ? '100%'
                    : '20%',
                }}
              />
            ))}
          </AvatarGroup>
        </ListItemAvatar>

        {/* <Typography variant={'caption'}>20 sec</Typography> */}
      </ListItemButton>
    </ListItem>
  );
}
