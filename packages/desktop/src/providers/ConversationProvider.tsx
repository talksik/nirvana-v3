import {
  ConnectToLineRequest,
  RtcAnswerSomeoneRequest,
  RtcCallRequest,
  RtcNewUserJoinedResponse,
  RtcReceiveAnswerResponse,
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneDisconnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  TuneToLineRequest,
  UntuneFromLineRequest,
} from '@nirvana/core/sockets/channels';
import { Container, Typography } from '@mui/material';
import Conversation, { MemberState } from '@nirvana/core/models/conversation.model';
import { ConversationMap, MasterConversation } from '../util/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Updater, useImmer } from 'use-immer';
import {
  checkIfOnOnOneExists,
  createConversation,
  getConversationById,
  getConversations,
  updateConversationPriority,
} from '../api/NirvanaApi';
import { useAsyncFn, useEffectOnce, useKeyPressEvent, useUnmount } from 'react-use';

import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import { KeyboardShortcuts } from '../util/keyboard';
import Peer from 'simple-peer';
import User from '@nirvana/core/models/user.model';
import toast from 'react-hot-toast';
import useAuth from './AuthProvider';
import useSockets from './SocketProvider';

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

const VIDEO_CONSTRAINTS = {
  frameRate: 15,
  width: { max: 720, ideal: 720, min: 100 },
  height: { max: 720, ideal: 720, min: 100 },
};

const AUDIO_CONSTRAINTS = {
  channelCount: {
    ideal: 2,
  },
};

interface IConversationContext {
  conversationMap: ConversationMap;

  // sorted conversation lists
  priorityConversations: MasterConversation[];
  inboxConversations: MasterConversation[];

  selectedConversation?: MasterConversation;
  selectConversation?: (conversationId: string, temporaryOverrideSort?: boolean) => Promise<void>;

  handleStartConversation?: (otherUsers: User[], conversationName?: string) => Promise<boolean>;

  handleEscape?: () => void;

  updateConversationPriority?: (conversationId: string, newState: MemberState) => Promise<void>;

  userLocalStream?: MediaStream;
  handleToggleVideo?: () => void;
}

const ConversationContext = React.createContext<IConversationContext>({
  conversationMap: {},
  priorityConversations: [],
  inboxConversations: [],
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
          console.error('no line');
          return;
        }

        draft[res.lineId].connectedUserIds = res.allConnectedUsers;
        draft[res.lineId].tunedInUsers = res.allTunedUsers;
      });
    });

    $ws.on(ServerResponseChannels.SOMEONE_TUNED_INTO_LINE, (res: SomeoneTunedResponse) => {
      setConversationMap((draft) => {
        if (!draft[res.lineId]) {
          console.error('no line');
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
            console.error('no line');
            return;
          }

          draft[res.lineId].tunedInUsers = draft[res.lineId].tunedInUsers.filter(
            (userId) => userId !== res.userId,
          );
        });
      },
    );
  }, [$ws, setConversationMap]);

  // remove them from the line connected list and tuned list if they are there
  $ws.on(
    ServerResponseChannels.SOMEONE_DISCONNECTED_FROM_LINE,
    (res: SomeoneDisconnectedResponse) => {
      setConversationMap((draft) => {
        if (!draft[res.lineId]) {
          console.error('there was a problem updating rooms!!!');
          return;
        }

        draft[res.lineId].connectedUserIds = draft[res.lineId].connectedUserIds?.filter(
          (userId) => userId !== res.userId,
        );
        draft[res.lineId].tunedInUsers = draft[res.lineId].tunedInUsers?.filter(
          (userId) => userId !== res.userId,
        );
      });
    },
  );

  // add the conversation to the conversation map/client side cache
  // has implications on realtime listening and also the ui on whether or not it's shown
  const handleAddConversationCache = useCallback(
    (conversation: Conversation, temporaryOverrideSort = false) => {
      setConversationMap((draft) => {
        draft[conversation._id.toString()] = {
          ...conversation,
          tunedInUsers: [],
          connectedUserIds: [],
          temporaryOverrideSort,
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
  // get conversation from universe...hit if it's local, miss and fetch if not here
  const selectConversation = useCallback(
    async (conversationId?: string, temporaryOverrideSort = false) => {
      /**
       * see if there is such a conversation in our map
       * if not, then go and fetch it from backend
       * set the temporary sort accordingly
       */

      // if we are try to clear or escape most likely
      if (!conversationId) {
        setSelectedConversation((prevConversation) => {
          // untuned from previous line
          if (prevConversation?._id) {
            const personalConvoMember = prevConversation.members?.find(
              (mem) => mem._id.toString() === user._id.toString(),
            );
            if (personalConvoMember && personalConvoMember.memberState === 'inbox') {
              handleUntuneFromLine(prevConversation._id.toString());
            }
          }

          return undefined;
        });
        return;
      }

      // if we are selecting same one, don't run more logic
      if (selectedConversation?._id.toString() === conversationId) {
        return;
      }

      const allConversationIds = Object.keys(conversationMap);
      let conversationToSelect: MasterConversation;

      if (allConversationIds.includes(conversationId)) {
        conversationToSelect = conversationMap[conversationId];
      } else {
        // TODO: somehow use handleAddToCache instead of this duplicated code

        // fetch and add to master conversation cache
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

        setConversationMap((draft) => {
          draft[conversationId] = newMasterConversation;
        });

        conversationToSelect = newMasterConversation;

        // connect to line so that we can listen in to changes
        handleConnectToLine(newMasterConversation._id.toString());
      }

      // set selected conversation with full master conversation now that we have it
      setSelectedConversation((prevConversation) => {
        // untune if it was an inbox conversation and we are going away from this conversation
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

      // !!TODO: go through each peer connection in the selected room and add the current stream
      // remove/stop casting stream to previously selected room
    },
    [
      user,
      conversationMap,
      selectedConversation,
      setSelectedConversation,
      setConversationMap,
      handleUntuneFromLine,
      handleTuneIntoLine,
      handleConnectToLine,
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
          toast.error('Must select other people!');

          return false;
        }

        // todo: check to make sure that the other user is not the user himself, although backend should error out

        if (otherUsers.length === 1) {
          console.log('checking if exists....');

          const conversationDmCheck = await checkIfOnOnOneExists(otherUsers[0]._id.toString());

          console.log(conversationDmCheck);

          // if we found a conversation
          if (conversationDmCheck.data) {
            console.log('already have this user...quick dialing');

            selectConversation(conversationDmCheck.data, true);
            return true;
          }
        }

        const createdConversationResult = await createConversation(
          new CreateConversationRequest(otherUsers, conversationName),
        );

        selectConversation(createdConversationResult.data.conversationId.toString(), true);

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

  const masterConversations = useMemo(() => {
    const priorityConversations: MasterConversation[] = [];
    const inboxConversations: MasterConversation[] = [];

    Object.values(conversationMap).forEach((currentMasterConversation) => {
      const personalConvoMember = currentMasterConversation.members.find(
        (mem) => mem._id.toString() === user._id.toString(),
      );
      if (personalConvoMember && personalConvoMember.memberState === 'priority') {
        priorityConversations.push(currentMasterConversation);

        return;
      }
      inboxConversations.push(currentMasterConversation);
    });

    // sort each list
    inboxConversations.sort((a, b) => {
      if (a.temporaryOverrideSort) {
        return 1;
      }

      if (b.temporaryOverrideSort) {
        return -1;
      }

      // sort by which ones have new activity for me
      // then sort by last activity date
    });

    priorityConversations.sort((a, b) => {
      return b.createdDate.valueOf() - a.createdDate.valueOf();
    });

    return [priorityConversations, inboxConversations];
  }, [conversationMap, user]);

  // move from priority to inbox and vice versa
  const updateConversationPriorityHandler = useCallback(
    async (conversationId: string, newState: MemberState) => {
      try {
        await updateConversationPriority(conversationId, newState);

        setConversationMap((draft) => {
          if (draft[conversationId]) {
            const currUserMember = draft[conversationId].members.find(
              (mem) => mem._id.toString() === user._id.toString(),
            );

            if (currUserMember) {
              currUserMember.memberState = newState;
            }
          }
        });
      } catch (error) {
        toast.error('problem in pinning conversation');
      }
    },
    [setConversationMap, user],
  );

  const [userLocalStream, setUserLocalStream] = useState<MediaStream>();
  const [userVideo, setUserVideo] = useState<boolean>(true);
  const [userAudio, setUserAudio] = useState<boolean>(false);

  useEffect(() => {
    // want to grab device stream even if not selected a room
    // only upload this stream to a room if we have a selected room

    if (userVideo || userAudio) {
      navigator.mediaDevices
        .getUserMedia({
          audio: userAudio ? AUDIO_CONSTRAINTS : false,
          video: userVideo ? VIDEO_CONSTRAINTS : false,
        })
        .then((userStream) => {
          console.log(`got new user stream`, userStream);

          // set global stream for slight feedback while talking
          setUserLocalStream(userStream);
        });
    } else {
      setUserLocalStream(undefined);
      // stop streaming to room now
    }
  }, [userVideo, userAudio, setUserLocalStream]);

  useEffect(() => {
    if (!userAudio) {
      userLocalStream?.getAudioTracks().map((track) => track.stop());
    }
  }, [userAudio, userLocalStream]);
  useEffect(() => {
    if (!userVideo) {
      userLocalStream?.getVideoTracks().map((track) => track.stop());
    }
  }, [userVideo, userLocalStream]);

  // take the local stream and use simple peer add track
  const handleToggleAudio = useCallback(() => {
    setUserAudio((prevVal) => !prevVal);
  }, []);

  const handleToggleVideo = useCallback(() => {
    setUserVideo((prevVal) => !prevVal);
  }, [setUserVideo]);

  // TODO: replace track of the same stream and
  const handleShareScreen = useCallback(() => {
    //
  }, []);

  useKeyPressEvent(KeyboardShortcuts.speak.shortcutKey, handleToggleAudio, handleToggleAudio);

  const handleEscape = useCallback(() => {
    selectConversation(undefined);
  }, [selectConversation]);

  useKeyPressEvent(KeyboardShortcuts.escape.shortcutKey, handleEscape);

  if (fetchState.error) {
    return (
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: 'white',
        }}
      >
        <Typography variant="caption" align="center">
          Something went terribly wrong
        </Typography>
      </Container>
    );
  }

  return (
    <ConversationContext.Provider
      value={{
        conversationMap,
        handleStartConversation,
        selectedConversation,
        selectConversation,
        priorityConversations: masterConversations[0],
        inboxConversations: masterConversations[1],
        handleEscape,
        updateConversationPriority: updateConversationPriorityHandler,
        userLocalStream,
        handleToggleVideo,
      }}
    >
      {children}

      {/* with id specified, shouldn't unmount and mount unexpectedly */}
      {userTunedInConversations.map((tunedConversation) => (
        <Room
          key={`streamRoom-${tunedConversation._id.toString()}`}
          setConversationMap={setConversationMap}
          conversation={tunedConversation}
        />
      ))}
    </ConversationContext.Provider>
  );
}

export default function useConversations() {
  return React.useContext(ConversationContext);
}

const iceServers = [
  // { urls: 'stun:stun.l.google.com:19302' },
  // { urls: 'stun:stun.l.google.com:19302' },
  // { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // { urls: 'stun:stun3.l.google.com:19302' },
  // { urls: 'stun:stun4.l.google.com:19302' },
  // { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
  // {
  //   url: 'turn:numb.viagenie.ca',
  //   credential: 'muazkh',
  //   username: 'webrtc@live.com',
  // },
  // {
  //   url: 'turn:192.158.29.39:3478?transport=udp',
  //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //   username: '28224511:1379330808',
  // },
  {
    url: 'turn:turn.bistri.com:80',
    credential: 'homeo',
    username: 'homeo',
  },

  // {
  //   url: 'turn:turn.anyfirewall.com:443?transport=tcp',
  //   credential: 'webrtc',
  //   username: 'webrtc',
  // },
  // {
  //   url: 'turn:openrelay.metered.ca:80',
  //   credential: 'openrelayproject',
  //   username: 'openrelayproject',
  // },
];

// renderless component to manage a room and send data upward for other components
//   - decoupled from sockets and other data, render if you want to join x room
//   - unmount if you want to leave room
//   - have event listeners specific to this room
//   - take in new users that come into the room
function Room({
  conversation,
  setConversationMap,
}: {
  conversation: MasterConversation;
  mediaStream?: MediaStream;
  setConversationMap: Updater<ConversationMap>;
}) {
  const { user } = useAuth();
  const { $ws } = useSockets();

  const [userLocalStream, setUserLocalStream] = useState<MediaStream>();

  // have internal state to manage details of this "room"

  // ============== STREAMING ===============

  // handle incoming calls and accept calls and create objects for them
  useEffectOnce(() => {
    // TODO : bring this stream object higher and add this later to the room
    // set up local stream for this room - temporary until we figure out global stream handling and passing down
    // const localMediaStream = await navigator.mediaDevices.getUserMedia({
    //   video: videoConstraints,
    //   audio: true,
    // });

    // console.log(localMediaStream);

    // setUserLocalStream(localMediaStream);

    // ?will there be race condition where this room component is rendered but we don't have the latest
    // ?list of tunedin folks and so we may just end up calling select few?
    // ?in this case, start with initiating event to get all people in room first

    if (conversation.tunedInUsers && conversation.tunedInUsers.length > 1) {
      // going ahead and calling all of the other folks
      const allOtherUserIds = conversation.tunedInUsers.filter(
        (memberUserId) => memberUserId !== user._id.toString(),
      );

      // for each person, create peer object
      allOtherUserIds.forEach((otherUserId) => {
        const connectingToast = toast.loading('connecting you for a snappy experience');

        // ========= PEER CREATION =============
        // make sure this peer gets destroyed when it's time to remove this listener
        const localPeerConnection = new Peer({
          initiator: true,
          // stream: localMediaStream,
          trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times,
          config: {
            iceServers,
          },
        });

        // ========= PEER EVENT HANDLERS =============
        localPeerConnection.on('signal', (signal) => {
          // console.log('have a signal to make call to someone ');

          // TODO: try modifying signal and offer to force stereo
          $ws.emit(
            ServerRequestChannels.RTC_CALL_SOMEONE_FOR_LINE,
            new RtcCallRequest(otherUserId, conversation._id.toString(), signal),
          );

          toast.dismiss(connectingToast);

          // todo, take trickle into account to not overwrite stream
          // notifying globally that we are in the process now
          setConversationMap((draft) => {
            if (draft[conversation._id.toString()]) {
              draft[conversation._id.toString()].room = {
                ...(draft[conversation._id.toString()].room ?? {}),
                [otherUserId]: { peer: localPeerConnection, isConnecting: true },
              };
            }
          });
        });

        localPeerConnection.on('stream', (remoteStream: MediaStream) => {
          // globally updating conversation so that other views can render what they want
          // toast.success('got stream from remote, going to add to our ');

          console.log('got stream from master');

          setConversationMap((draft) => {
            if (draft[conversation._id.toString()].room[otherUserId]) {
              draft[conversation._id.toString()].room[otherUserId].stream = remoteStream;

              remoteStream.getTracks().forEach((track) => {
                // TODO: add particular track to right place
              });
            }
          });
        });

        localPeerConnection.on('connect', () => {
          console.log('successfully connected to another peer');
          setConversationMap((draft) => {
            if (draft[conversation._id.toString()].room[otherUserId]) {
              draft[conversation._id.toString()].room[otherUserId].isConnecting = false;
            }
          });
        });

        localPeerConnection.on('track', (track, stream) => {
          // TODO: add to room peer stream or replace the entire stream

          toast('a peer added a track to a stream');
        });

        localPeerConnection.on('close', () => {
          // the person will be removed from the tuned in list, but the connections here are decoupled from that flow
          // we want to manage the room within the master conversation and remove it for ourselves
          // !this is false, see unmount, we are relying on tuned list for disconnections

          console.error('peer connection was closed');

          setConversationMap((draft) => {
            if (draft[conversation._id.toString()].room[otherUserId]) {
              draft[conversation._id.toString()].room[otherUserId].peer?.destroy();
              delete draft[conversation._id.toString()].room[otherUserId];
            }
          });

          toast.error('peer connection was closed');
        });

        localPeerConnection.on('error', (err) => {
          console.error(err);
          toast.error('there was a problem with the connecting');

          setConversationMap((draft) => {
            if (draft[conversation._id.toString()].room[otherUserId]) {
              draft[conversation._id.toString()].room[otherUserId].peer?.destroy();
              delete draft[conversation._id.toString()].room[otherUserId];
            }
          });
        });
      });
    }
  });

  // ======= LISTEN FOR INCOMING CALLS AND RETURN SIGNALS AND ACCEPT THEM
  useEffect(() => {
    const someoneJoinedChannelNameForRoom = `${
      ServerResponseChannels.RTC_NEW_USER_JOINED
    }:${conversation._id.toString()}`;
    const mastersAnswerReceivedChannelNameForRoom = `${
      ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER
    }:${conversation._id.toString()}`;

    $ws.on(someoneJoinedChannelNameForRoom, (res: RtcNewUserJoinedResponse) => {
      // toast.success('NEWBIE JOINED!!!');
      console.log('someone calling me', res);

      // todo, take trickle into account to not overwrite prev peer

      const peerForMeAndNewbie = new Peer({
        initiator: false,
        // stream: userLocalStream,
        trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
        config: {
          iceServers,
        },
      });

      peerForMeAndNewbie.signal(res.simplePeerSignal);

      setConversationMap((draft) => {
        if (draft[conversation._id.toString()]) {
          draft[conversation._id.toString()].room = {
            ...(draft[conversation._id.toString()].room ?? {}),
            [res.userWhoCalled]: { peer: peerForMeAndNewbie, isConnecting: true },
          };
        }
      });

      peerForMeAndNewbie.on('signal', (signal) => {
        console.log('sending an answer to the slave', res);

        $ws.emit(
          ServerRequestChannels.RTC_ANSWER_SOMEONE_FOR_LINE,
          new RtcAnswerSomeoneRequest(res.userWhoCalled, res.lineId, signal),
        );
      });

      peerForMeAndNewbie.on('stream', (remoteStream: MediaStream) => {
        // globally updating conversation so that other views can render what they want
        // toast.success('got stream from remote, going to add to our ');

        console.log('got stream from newbie');

        setConversationMap((draft) => {
          if (draft[conversation._id.toString()].room[res.userWhoCalled]) {
            draft[conversation._id.toString()].room[res.userWhoCalled].stream = remoteStream;
            remoteStream.getTracks().forEach((track) => {
              // TODO: add particular track to right place
            });
          }
        });
      });

      peerForMeAndNewbie.on('connect', () => {
        toast.success('successfully connected to another peer');
        setConversationMap((draft) => {
          if (draft[conversation._id.toString()].room[res.userWhoCalled]) {
            draft[conversation._id.toString()].room[res.userWhoCalled].isConnecting = false;
          }
        });
      });

      peerForMeAndNewbie.on('track', (track, stream) => {
        // TODO: add to room contents

        toast('a peer added a track to a stream');
      });

      peerForMeAndNewbie.on('close', () => {
        // the person will be removed from the tuned in list, but the connections here are decoupled from that flow
        // we want to manage the room within the master conversation and remove it for ourselves
        // !this is false, see unmount, we are relying on tuned list for disconnections

        setConversationMap((draft) => {
          if (draft[conversation._id.toString()].room[res.userWhoCalled]) {
            draft[conversation._id.toString()].room[res.userWhoCalled].peer?.destroy();
            delete draft[conversation._id.toString()].room[res.userWhoCalled];
          }
        });

        console.error('peer connection was closed');

        toast.error('peer connection was closed');
      });

      peerForMeAndNewbie.on('error', (err) => {
        console.error(err);
        toast.error('there was a problem with connecting');

        setConversationMap((draft) => {
          if (draft[conversation._id.toString()].room[res.userWhoCalled]) {
            draft[conversation._id.toString()].room[res.userWhoCalled].peer?.destroy();
            delete draft[conversation._id.toString()].room[res.userWhoCalled];
          }
        });
      });
    });

    $ws.on(mastersAnswerReceivedChannelNameForRoom, (res: RtcReceiveAnswerResponse) => {
      // toast.success('MASTER gave me an answer!!!');

      console.log('master gave me this answer: ', res);

      // find our local connection to this peer in the room contents
      setConversationMap((draft) => {
        const localPeerForMasterAndMe = draft[res.lineId]?.room[res.masterUserId];

        if (localPeerForMasterAndMe) {
          localPeerForMasterAndMe.peer.signal(res.simplePeerSignal);
        }
      });
    });

    return () => {
      $ws.removeAllListeners(mastersAnswerReceivedChannelNameForRoom);
      $ws.removeAllListeners(someoneJoinedChannelNameForRoom);
    };
  }, [userLocalStream]);

  // find when someone leaves the room and destroy peer and remove them from our map
  useEffect(() => {
    // go through tuned in users
    // if we have someone in room who is not in tuned in, then destroy + delete

    setConversationMap((draft) => {
      if (draft[conversation._id.toString()].room) {
        Object.entries(draft[conversation._id.toString()].room).forEach(
          ([roomUserId, roomContents]) => {
            if (!conversation.tunedInUsers.includes(roomUserId)) {
              console.log('someone left the room!!!');

              roomContents.peer.destroy();

              delete draft[conversation._id.toString()].room[roomUserId];
            }
          },
        );
      }
    });
  }, [conversation.tunedInUsers, setConversationMap]);

  // go through all of the peers and destroy and update conversation map
  useUnmount(() => {
    setConversationMap((draft) => {
      if (draft[conversation._id.toString()].room) {
        Object.values(draft[conversation._id.toString()].room).forEach((roomPeerContents) => {
          roomPeerContents.peer.destroy();

          console.log('destroyed peer connection as I am leaving room');
        });
      }

      delete draft[conversation._id.toString()].room;
    });
  });

  // TODO: improved listener manager for each peer connection
  const setPeerListeners = useCallback(
    (peer) => {
      //
    },
    [setConversationMap],
  );

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
  }, [conversation.tunedInUsers]);

  return null;
}

// ANOTHER APPROACH
// have one hook used in the upper level
// this hook renders multiple components for each room
// each component for each room returns data for that room
// this upper level rooms hook returns each room's data
