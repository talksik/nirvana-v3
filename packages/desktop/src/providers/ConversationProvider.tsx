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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

// responsible for managing devices, managing streams
// initiating calls, managing incoming calls
// joining room
// leaving room
// playing audio
// handling device switching
// handling muting and unmuting
// showing when there are problems
function useCommunications() {
  const { $ws } = useSockets();

  useEffect(() => {
    // select initial devices and create initial stream
  }, []);

  // go and create connection with everyone already here
  const handleJoinRoom = useCallback((peopleAlreadyHere: string[]) => {
    // create n peer objects
    // for each
    //    - create a signal
    //    - send signal to the other person
    //    - return peer object
  }, []);

  return { handleJoinRoom };
}

// responsible for firing socket events from the local client
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

  // fetch conversations
  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // conversation socket listeners
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

      // if it's in my priority list, tune into it automatically
      const currMemberForConversation = conversation.members.find(
        (mem) => mem.email === user.email,
      );
      if (currMemberForConversation && currMemberForConversation.memberState === 'priority') {
        handleTuneIntoLine(conversation._id.toString());
      }
    },
    [setConversationMap, handleConnectToLine, handleTuneIntoLine, user],
  );

  // add conversations to cache on initial fetch
  // the two stores | persistent and socket | are decoupled
  useEffect(() => {
    if (fetchState.value?.data) {
      fetchState.value.data.forEach((conversationResult) => {
        handleAddConversationCache(conversationResult);
      });
    }
  }, [fetchState.value, handleAddConversationCache]);

  /**
   * temporaryOverrideSort: tell me if you want to temporarily prioritize this conversation above all others
   */
  // selecting an id and making sure that it's in the map and the views just use the id to access from map
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
        // only untune if it was an inbox conversation

        if (prevConversation) {
          const currMemberForConversation = prevConversation.members.find(
            (mem) => mem.email === user.email,
          );

          if (currMemberForConversation && currMemberForConversation.memberState === 'inbox') {
            handleUntuneFromLine(prevConversation._id.toString());
          }
        }

        handleTuneIntoLine(conversationToSelect._id.toString());

        return conversationToSelect;
      });
    },
    [
      user,
      conversationMap,
      setSelectedConversation,
      setConversationMap,
      handleUntuneFromLine,
      handleTuneIntoLine,
    ],
  );
  // !temporary fix for updated conversation content not being surfaced
  // as the map value updates
  useEffect(() => {
    if (selectedConversation) {
      setSelectedConversation(conversationMap[selectedConversation._id.toString()]);
    }
  }, [conversationMap, selectedConversation, setSelectedConversation]);

  // handling quick dial or creating a conversation
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

  const userTunedInConversations = useMemo(() => {
    const tunedConversations: MasterConversation[] = [];

    Object.values(conversationMap).forEach((currentMasterConversation) => {
      if (currentMasterConversation.tunedInUsers.includes(user._id.toString())) {
        tunedConversations.push(currentMasterConversation);
      }
    });

    return tunedConversations;
  }, [conversationMap, user]);

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

      {/* with id specified, shouldn't unmount and mount unexpectedly */}
      {userTunedInConversations.map((tunedConversation) => (
        <Room
          key={`streamRoom-${tunedConversation._id.toString()}`}
          conversation={tunedConversation}
        />
      ))}
    </ConversationContext.Provider>
  );
}

export default function useConversations() {
  return React.useContext(ConversationContext);
}

// renderless component to manage a room and send data upward for other components
//   - decoupled from sockets and other data, render if you want to join x room
//   - unmount if you want to leave room
//   - have event listeners specific to this room
//   - take in new users that come into the room
function Room({ conversation }: { conversation: MasterConversation }) {
  // have internal state to manage details of this "room"

  // ============== STREAMING ===============

  // handle incoming calls and accept calls and create objects for them
  useEffect(() => {
    //
  }, []);

  const handleJoinRoom = useCallback((roomId: string) => {
    // call up folks and then have listeners for the peer connection objects that we created
    //   such as when peer connection closes, we want to remove from our list of peers for such conversation
    //   error handler as well for the peer connection
    // rest endpoint to get all of the folks in a certain room
  }, []);

  const handleLeaveRoom = useCallback(() => {
    // untune from line
    // destroy peer connections
  }, []);

  // share audio to foreground conversation | either push to talk or toggle broadcasting
  const handleStartTalking = useCallback((record = false) => {
    // if record, then start recording
    // add stream if not there for this peer connection or just add track to stream
  }, []);

  const handleStopTalking = useCallback(() => {
    // stop recording if was recording
    // stop sharing audio | maybe stop track to avoid stereo distortion
  }, []);

  const handleShareVideo = useCallback(() => {
    // add track and/or stream of video to the peer connections for currently selected room
  }, []);

  const handleShareScreen = useCallback(() => {
    // add track and/or stream of screen to the peer connections for currently selected room
  }, []);

  // ============= END OF STREAMING MODULE ========

  useEffect(() => {
    // call all of the tuned in folks that are already here
    console.log(conversation.tunedInUsers);

    return () => {
      // close peer connections here
      // update the conversation map as well with proper states and data
    };
  }, []);

  return null;
}
