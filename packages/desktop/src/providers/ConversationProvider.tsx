import React, { useEffect } from 'react';

import Conversation from '@nirvana/core/models/conversation.model';
import { ConversationMap } from '../util/types';
import { Typography } from '@mui/material';
import { getConversations } from '../api/NirvanaApi';
import { useAsyncFn } from 'react-use';
import { useImmer } from 'use-immer';

interface IConversationContext {
  conversations: ConversationMap;
}

const ConversationContext = React.createContext<IConversationContext>({
  conversations: {},
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  // the initial persistent fetch for conversations
  const [fetchState, doFetch] = useAsyncFn(getConversations);

  // the map that we manage throughout the app
  const [conversationMap, setConversationMap] = useImmer<ConversationMap>({});

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    console.log(fetchState.value);

    if (fetchState.value?.data) {
      setConversationMap((draft) => {
        fetchState.value.data.forEach((conversationResult) => {
          draft[conversationResult._id.toString()] = {
            ...conversationResult,
            tunedInUsers: [],
            connectedUserIds: [],
          };
        });
      });
    }
  }, [fetchState.value, setConversationMap]);

  // todo: open up a handler for children
  // to refetch or search for a particular conversation and add it to the list of conversations

  // todo: transform conversations to a map and keep adding to the map

  if (fetchState.error) {
    return (
      <Typography variant={'h6'} color={'danger'}>
        Something went terribly wrong
      </Typography>
    );
  }

  return (
    <ConversationContext.Provider value={{ conversations: conversationMap }}>
      {children}
    </ConversationContext.Provider>
  );
}

export default function useConversations() {
  return React.useContext(ConversationContext);
}
