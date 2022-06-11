import {
  ConnectToLineRequest,
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  TuneToLineRequest,
  UntuneFromLineRequest,
} from '@nirvana/core/sockets/channels';
import Conversation, { MemberState } from '@nirvana/core/models/conversation.model';
import { ConversationMap, MasterConversation } from '../util/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
  checkIfOnOnOneExists,
  createConversation,
  getConversationById,
  getConversations,
} from '../api/NirvanaApi';

import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import { Typography } from '@mui/material';
import User from '@nirvana/core/models/user.model';
import toast from 'react-hot-toast';
import { useAsyncFn } from 'react-use';
import useAuth from './AuthProvider';
import { useImmer } from 'use-immer';
import useSockets from './SocketProvider';

function useSocketFire() {
  const { $ws } = useSockets();

  const handleConnectToLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.CONNECT_TO_LINE, new ConnectToLineRequest(lineId));
    },
    [$ws],
  );

  const handleTuneIntoLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.TUNE_INTO_LINE, new TuneToLineRequest(lineId));
    },
    [$ws],
  );

  const handleUntuneFromLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.UNTUNE_FROM_LINE, new UntuneFromLineRequest(lineId));
    },
    [$ws],
  );

  return { handleConnectToLine, handleTuneIntoLine, handleUntuneFromLine };
}

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
  const { user } = useAuth();

  // the initial persistent fetch for conversations
  const [fetchState, doFetch] = useAsyncFn(getConversations);

  // the map that we manage throughout the app
  const [conversationMap, setConversationMap] = useImmer<ConversationMap>({});

  const [selectedConversation, setSelectedConversation] = useState<MasterConversation>(undefined);

  const { $ws } = useSockets();
  const { handleConnectToLine, handleTuneIntoLine, handleUntuneFromLine } = useSocketFire();

  useEffect(() => {
    $ws.on(ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE, (res: SomeoneConnectedResponse) => {
      setConversationMap((draft) => {
        if (!draft[res.lineId]) {
          toast.error('no line');
          return;
        }

        draft[res.lineId].connectedUserIds = res.allUsers;
      });
    });

    $ws.on(ServerResponseChannels.SOMEONE_TUNED_INTO_LINE, (res: SomeoneTunedResponse) => {
      setConversationMap((draft) => {
        if (!draft[res.lineId]) {
          toast.error('no line');
          return;
        }

        draft[res.lineId].tunedInUsers = res.allUsers;
      });
    });

    $ws.on(
      ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
      (res: SomeoneUntunedFromLineResponse) => {
        setConversationMap((draft) => {
          if (!draft[res.lineId]) {
            toast.error('no line');
            return;
          }

          draft[res.lineId].tunedInUsers = draft[res.lineId].tunedInUsers.filter(
            (userId) => userId !== res.userId,
          );
        });
      },
    );
  }, [$ws, setConversationMap]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // add the conversation to the conversation map/client side cache
  // has implications on realtime listening and also the ui on whether or not it's shown
  const handleAddConversationCache = useCallback(
    (conversation: Conversation) => {
      setConversationMap((draft) => {
        draft[conversation._id.toString()] = {
          ...conversation,
          tunedInUsers: [],
          connectedUserIds: [],
        };
      });

      handleConnectToLine(conversation._id.toString());

      const currMemberForConversation = conversation.members.find(
        (mem) => mem.email === user.email,
      );

      if (currMemberForConversation && currMemberForConversation.memberState === 'priority') {
        handleTuneIntoLine(conversation._id.toString());
      }
    },
    [setConversationMap, handleConnectToLine, handleTuneIntoLine, user],
  );

  useEffect(() => {
    console.log(fetchState.value);

    if (fetchState.value?.data) {
      fetchState.value.data.forEach((conversationResult) => {
        handleAddConversationCache(conversationResult);
      });
    }
  }, [fetchState.value, handleAddConversationCache]);

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
      let conversationToSelect: MasterConversation;

      if (allConversationIds.includes(conversationId)) {
        toast.success('we have that conversation!!!');

        conversationToSelect = conversationMap[conversationId];
      } else {
        // fetch and add to conversation map
        const retrieveConversationResult = await getConversationById(conversationId);
        if (!retrieveConversationResult.data) {
          toast.error('unable to find conversation');
          return;
        }

        const newMasterConversation: MasterConversation = {
          ...retrieveConversationResult.data,
          tunedInUsers: [],
          connectedUserIds: [],
          temporaryOverrideSort,
        };

        conversationToSelect = newMasterConversation;

        setConversationMap((draft) => {
          draft[conversationId] = newMasterConversation;
        });
      }

      setSelectedConversation((prevConversation) => {
        if (prevConversation) {
          handleUntuneFromLine(prevConversation._id.toString());
        }

        handleTuneIntoLine(conversationToSelect._id.toString());

        return conversationToSelect;
      });
    },
    [conversationMap, setSelectedConversation, setConversationMap, handleUntuneFromLine],
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
