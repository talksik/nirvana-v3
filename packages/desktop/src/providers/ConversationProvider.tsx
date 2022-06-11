import { ConversationMap, MasterConversation } from '../util/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
  checkIfOnOnOneExists,
  createConversation,
  getConversationById,
  getConversations,
} from '../api/NirvanaApi';

import Conversation from '@nirvana/core/models/conversation.model';
import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import { Typography } from '@mui/material';
import User from '@nirvana/core/models/user.model';
import toast from 'react-hot-toast';
import { useAsyncFn } from 'react-use';
import { useImmer } from 'use-immer';

interface IConversationContext {
  conversationMap: ConversationMap;

  selectedConversation?: MasterConversation;
  selectConversation?: (conversationId: string, temporaryOverrideSort?: boolean) => Promise<void>;

  handleStartConversation?: (otherUsers: User[], conversationName?: string) => Promise<boolean>;
}

const ConversationContext = React.createContext<IConversationContext>({
  conversationMap: {},
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  // the initial persistent fetch for conversations
  const [fetchState, doFetch] = useAsyncFn(getConversations);

  // the map that we manage throughout the app
  const [conversationMap, setConversationMap] = useImmer<ConversationMap>({});

  const [selectedConversation, setSelectedConversation] = useState<MasterConversation>(undefined);

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

  /**
   * temporaryOverrideSort: tell me if you want to temporarily prioritize this conversation above all others
   */
  const selectConversation = useCallback(
    async (conversationId: string, temporaryOverrideSort = false) => {
      /**
       * see if there is such a conversation in our map
       * if not, then go and fetch it from backend
       * set the temporary sort accordingly
       */

      const allConversationIds = Object.keys(conversationMap);

      if (allConversationIds.includes(conversationId)) {
        toast.success('we have that conversation!!!');

        setSelectedConversation(conversationMap[conversationId]);

        return;
      }

      // fetch and add to conversation map
      const retrieveConversationResult = await getConversationById(conversationId);
      if (!retrieveConversationResult.data) {
        toast.error('unable to select conversation');
        return;
      }

      setConversationMap((draft) => {
        draft[conversationId] = {
          ...retrieveConversationResult.data,
          tunedInUsers: [],
          connectedUserIds: [],
          temporaryOverrideSort,
        };

        setSelectedConversation(draft[conversationId]);
      });
    },
    [conversationMap, setSelectedConversation, setConversationMap],
  );

  const handleStartConversation = useCallback(
    async (otherUsers: User[], conversationName?: string) => {
      try {
        /** group conversation
         * 1. create it
         * 2. select the conversation based on the id
         *
         * one on one:
         * 1. hit backend to see if we already have a conversation with them
         * 2. if so, then go and select it with priority sort flag
         * 3. if not, then go ahead and create
         * 4. use the conversation id to select it
         */

        if (!otherUsers || otherUsers.length === 0) {
          toast.error('Must provider users');
          return false;
        }

        // todo: check to make sure that the other user is not the user himself, although backend should error out

        if (otherUsers.length === 1) {
          const conversationDmCheck = await checkIfOnOnOneExists(otherUsers[0]._id.toString());

          // if we found a conversation
          if (conversationDmCheck.data) {
            toast.success('already have this user...quick dialing');

            selectConversation(conversationDmCheck.data, true);
            return true;
          }
        }

        const createdConversationResult = await createConversation(
          new CreateConversationRequest(otherUsers, conversationName),
        );

        selectConversation(createdConversationResult.data.conversationId.toString(), true);

        toast.success('started conversation');

        return true;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
      return false;
    },
    [selectConversation],
  );

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
    <ConversationContext.Provider
      value={{
        conversationMap,
        handleStartConversation,
        selectedConversation,
        selectConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export default function useConversations() {
  return React.useContext(ConversationContext);
}
