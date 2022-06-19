import {
  ConnectToLineRequest,
  RtcAnswerSomeoneRequest,
  RtcCallRequest,
  RtcNewUserJoinedResponse,
  RtcReceiveAnswerResponse,
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
import { Updater, useImmer } from 'use-immer';
import {
  checkIfOnOnOneExists,
  createConversation,
  getConversationById,
  getConversations,
} from '../api/NirvanaApi';
import { useAsyncFn, useEffectOnce } from 'react-use';

import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import Peer from 'simple-peer';
import { Typography } from '@mui/material';
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

const videoConstraints = {
  frameRate: 15,
  width: { max: 100 },
  height: { max: 200 },
};

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
  // {
  //   url: 'turn:turn.bistri.com:80',
  //   credential: 'homeo',
  //   username: 'homeo',
  // },
  // {
  //   url: 'turn:turn.anyfirewall.com:443?transport=tcp',
  //   credential: 'webrtc',
  //   username: 'webrtc',
  // },
  {
    url: 'turn:openrelay.metered.ca:80',
    credential: 'openrelayproject',
    username: 'openrelayproject',
  },
];

function useDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const uniqueDevices: MediaDeviceInfo[] = [];

      const uniqueGroupIds = [];
      devices.forEach((device) => {
        if (!uniqueGroupIds.includes(device.groupId)) {
          uniqueDevices.push(device);
          uniqueGroupIds.push(device.groupId);
        }
      });

      setDevices(uniqueDevices);
    });
  }, []);

  // navigator.mediaDevices
  //   .getUserMedia({
  //     video: videoConstraints,
  //     audio: true,
  //   })
  //   .then((localMediaStream: MediaStream) => {
  //     setUserLocalStream(localMediaStream);
  //   });

  return devices;
}

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

  // have internal state to manage details of this "room"

  // ============== STREAMING ===============

  // handle incoming calls and accept calls and create objects for them
  useEffectOnce(() => {
    const localPeersForRoom: Peer[] = [];

    // ?will there be race condition where this room component is rendered but we don't have the latest
    // ?list of tunedin folks and so we may just end up calling select few?
    // ?in this case, start with initiating event to get all people in room first

    if (conversation.tunedInUsers && conversation.tunedInUsers.length > 1) {
      // going ahead and calling all of the other folks
      const allOtherUserIds = conversation.tunedInUsers.filter(
        (memberUserId) => memberUserId !== user._id.toString(),
      );
      toast.success('calling bunch of people');

      // TODO : bring this stream object higher and add this later to the room
      navigator.mediaDevices
        .getUserMedia({ video: videoConstraints, audio: true })
        .then((localMediaStream: MediaStream) => {
          // for each person, create peer object
          allOtherUserIds.forEach((otherUserId) => {
            const connectingToast = toast.loading('calling peer for a snappy experience');

            // ========= PEER CREATION =============
            // make sure this peer gets destroyed when it's time to remove this listener
            const localPeerConnection = new Peer({
              initiator: true,
              stream: localMediaStream,
              trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times,
              config: {
                iceServers,
              },
            });

            // ========= PEER EVENT HANDLERS =============
            localPeerConnection.on('signal', (signal) => {
              console.log('have a signal to make call to someone ');

              $ws.emit(
                ServerRequestChannels.RTC_CALL_SOMEONE_FOR_LINE,
                new RtcCallRequest(otherUserId, conversation._id.toString(), signal),
              );

              toast.dismiss(connectingToast);

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
              toast.success('got stream from remote, going to add to our ');

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
              toast.success('successfully connected to another peer');
              setConversationMap((draft) => {
                if (draft[conversation._id.toString()].room[otherUserId]) {
                  draft[conversation._id.toString()].room[otherUserId].isConnecting = false;
                }
              });
            });

            localPeerConnection.on('track', (track, stream) => {
              // TODO: add to room contents

              toast('a peer added a track to a stream');
            });

            localPeerConnection.on('close', () => {
              // the person will be removed from the tuned in list, but the connections here are decoupled from that flow
              // we want to manage the room within the master conversation and remove it for ourselves

              // TODO: update the map to remove the user and all contribution contens

              toast.error('peer connection was closed');
            });

            localPeerConnection.on('error', (err) => {
              console.error(err);
              toast.error('there was a problem with the peer connection');
            });

            localPeersForRoom.push(localPeerConnection);
          });
        });

      return () => {
        // go through all peer connections and destroy them
        // remove all room contents as well
        localPeersForRoom.forEach((peerConnection) => {
          peerConnection.destroy();
        });
      };
    }

    // ======= LISTEN FOR INCOMING CALLS AND ACCEPT THEM

    return () => {
      localPeersForRoom.forEach((peerToClose) => peerToClose.destroy());
    };
  });

  useEffectOnce(() => {
    const localNewbiesForRoom: Peer[] = [];

    const someoneJoinedChannelNameForRoom = `${
      ServerResponseChannels.RTC_NEW_USER_JOINED
    }:${conversation._id.toString()}`;
    const mastersAnswerReceivedChannelNameForRoom = `${
      ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER
    }:${conversation._id.toString()}`;

    $ws.on(someoneJoinedChannelNameForRoom, (res: RtcNewUserJoinedResponse) => {
      toast.success('NEWBIE JOINED!!!');
      console.log('someone calling me', res);

      const peerForMeAndNewbie = new Peer({
        initiator: false,
        trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
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
        toast.success('got stream from remote, going to add to our ');

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

        // TODO: update the map to remove the user and all contribution contens

        toast.error('peer connection was closed');
      });

      peerForMeAndNewbie.on('error', (err) => {
        console.error(err);
        toast.error('there was a problem with the peer connection');
      });

      localNewbiesForRoom.push(peerForMeAndNewbie);
    });

    $ws.on(mastersAnswerReceivedChannelNameForRoom, (res: RtcReceiveAnswerResponse) => {
      toast.success('MASTER gave me an answer!!!');

      console.log('master gave me this answer: ', res);

      // find our local connection to this peer in the room contents
      setConversationMap((draft) => {
        const localPeerForMasterAndMe = draft[res.lineId]?.room[res.lineId];

        if (localPeerForMasterAndMe) {
          localPeerForMasterAndMe.peer.signal(res.simplePeerSignal);
        }
      });
    });

    return () => {
      $ws.removeAllListeners(mastersAnswerReceivedChannelNameForRoom);
      $ws.removeAllListeners(someoneJoinedChannelNameForRoom);
    };
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
  }, []);

  return null;
}

// ANOTHER APPROACH
// have one hook used in the upper level
// this hook renders multiple components for each room
// each component for each room returns data for that room
// this upper level rooms hook returns each room's data
