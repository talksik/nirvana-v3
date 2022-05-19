import React, { useEffect, useContext, useState, useRef, useMemo, useCallback } from 'react';
import Peer from 'simple-peer';
import useAuth from './AuthProvider';
import { useImmer } from 'use-immer';
import useSockets from './SocketProvider';
import {
  RtcAnswerSomeoneRequest,
  RtcCallRequest,
  RtcNewUserJoinedResponse,
  RtcReceiveAnswerResponse,
  ServerRequestChannels,
  ServerResponseChannels,
} from '@nirvana/core/sockets/channels';
import toast from 'react-hot-toast';
import useTerminalProvider from './TerminalProvider';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { useEffectOnce } from 'react-use';

type LinePeerMap = {
  [lineId: string]: { userId: string; peer: Peer; mediaStream?: MediaStream }[];
};
interface IStreamProvider {
  peerMap: LinePeerMap;
  userLocalStream?: MediaStream;
}

const StreamProviderContext = React.createContext<IStreamProvider>({
  peerMap: {},
});

export function StreamProvider({ children }: { children: React.ReactChild }) {
  const { roomsMap } = useTerminalProvider();
  const { user } = useAuth();

  const { $ws } = useSockets();

  const [peerMap, updatePeerMap] = useImmer<LinePeerMap>({});

  const [userLocalStream, setUserLocalStream] = useState<MediaStream>();
  const [localUserStreams, setLocalUserStreams] = useImmer<{ [lineId: string]: MediaStream }>({});

  useEffect(() => {
    $ws.on(ServerResponseChannels.RTC_NEW_USER_JOINED, (res: RtcNewUserJoinedResponse) => {
      toast.success('NEWBIE JOINED!!!');
      console.log('someone calling me', res);

      const peerForMeAndNewbie = new Peer({
        initiator: false,
        trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
        stream: userLocalStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
            {
              url: 'turn:numb.viagenie.ca',
              credential: 'muazkh',
              username: 'webrtc@live.com',
            },
          ],
        },
      });

      peerForMeAndNewbie.signal(res.simplePeerSignal);

      handleAddPeer(res.lineId, res.userWhoCalled, peerForMeAndNewbie, userLocalStream);

      peerForMeAndNewbie.on('signal', (signal) => {
        console.log('sending an answer to the slave', res);

        $ws.emit(
          ServerRequestChannels.RTC_ANSWER_SOMEONE_FOR_LINE,
          new RtcAnswerSomeoneRequest(res.userWhoCalled, res.lineId, signal),
        );
      });

      // !adding stream here causes race condition of the signal event just running over and over again

      // see if I have a stream for this channel or line
      // create one if not, and add to stream
      // navigator.mediaDevices
      //   .getUserMedia({ video: true, audio: true })
      //   .then((currStream: MediaStream) => {
      //     peerForMeAndNewbie.addStream(currStream);
      //   });
    });

    $ws.on(ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER, (res: RtcReceiveAnswerResponse) => {
      toast.success('MASTER gave me an answer!!!');

      console.log('master gave me this answer: ', res);

      // find this person in peer map
      updatePeerMap((draft) => {
        const localPeerForMasterAndMe = draft[res.lineId].find(
          (currPeerRelationship) => currPeerRelationship.userId === res.masterUserId,
        );

        if (localPeerForMasterAndMe) localPeerForMasterAndMe.peer.signal(res.simplePeerSignal);
      });
    });

    return () => {
      $ws.removeAllListeners(ServerResponseChannels.RTC_NEW_USER_JOINED);
      $ws.removeAllListeners(ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER);
    };
  }, [updatePeerMap, $ws, userLocalStream]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const uniqueDevices = [];

      const uniqueGroupIds = [];
      devices.forEach((device) => {
        if (!uniqueGroupIds.includes(device.groupId)) {
          uniqueDevices.push(device);
          uniqueGroupIds.push(device.groupId);
        }
      });

      console.log(uniqueDevices);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localMediaStream: MediaStream) => {
        setUserLocalStream(localMediaStream);
      });
  }, []);

  console.log(`peer map: `, peerMap);

  const handleAddPeer = useCallback(
    (lineId: string, userId: string, peerObj: Peer, mediaStream?: MediaStream) => {
      updatePeerMap((draft) => {
        // for trickling, if we already have a peer for this line and user, then just replace
        const existingUserLinePeerRelation = draft[lineId]?.find(
          (currPeerRelation) => currPeerRelation.userId === userId,
        );
        if (existingUserLinePeerRelation) {
          return draft;
        }

        if (draft[lineId]) {
          draft[lineId].push({ userId, peer: peerObj, mediaStream });
        } else {
          draft[lineId] = [{ userId, peer: peerObj, mediaStream }];
        }
      });
    },
    [updatePeerMap],
  );

  return (
    <StreamProviderContext.Provider value={{ peerMap, userLocalStream }}>
      {/* handles stream connections */}
      {Object.values(roomsMap).map((line) => {
        if (line.tunedInMemberIds?.includes(user._id.toString()))
          return (
            <MemoLineConnector
              key={`streamConnector-${line.lineDetails._id.toString()}`}
              lineId={line.lineDetails._id.toString()}
              handleAddPeer={handleAddPeer}
              membersToCall={line.tunedInMemberIds.filter(
                (currMemberId) => currMemberId !== user._id.toString(),
              )}
            />
          );
      })}

      {children}
    </StreamProviderContext.Provider>
  );
}

export default function useStreams() {
  return useContext(StreamProviderContext);
}

const MemoLineConnector = React.memo(LineConnector);

// handle managing stream connections for one line
function LineConnector({
  lineId,
  membersToCall,
  handleAddPeer,
}: {
  lineId: string;
  membersToCall: string[];
  handleAddPeer: (lineId: string, userId: string, peerObj: Peer, mediaStream?: MediaStream) => void;
}) {
  const { $ws } = useSockets();

  console.log('rendering this piece of shit');

  useEffectOnce(() => {
    console.log('got initial list for this channel that I am tuned into');

    console.log(membersToCall);
    // call these people
    // tell them what line I'm calling about, so that they can use the signal for the right peer object
    // also so that I can signal for the peer object relationship between me and this other person for this particular channel

    // then add in the stream to this local peer relationship object

    // todo get the user media selections
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localMediaStream: MediaStream) => {
        // todo check if already in peer map? keeping it simple for now
        // a peer relationship between me and someone for this particular channel so that I can just enable or disable this particular stream
        // object instead of managing different ones

        // bandwidth wise, would be uploading stream to one room at a time but downloading a x b streams but someone can't
        // stream in two at same time anyway

        toast.success('CALLING bunch of people!!!');
        console.log('Calling these folks', membersToCall);
        console.log('for line', lineId);

        // todo...call in parallel
        membersToCall.map((memberId) => {
          const connectingToast = toast.loading('calling peer for a snappy experience');

          const localPeerConnection = new Peer({
            initiator: true,
            stream: localMediaStream,
            trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
                {
                  url: 'turn:numb.viagenie.ca',
                  credential: 'muazkh',
                  username: 'webrtc@live.com',
                },
              ],
            },
          });

          localPeerConnection.on('signal', (signal) => {
            console.log('have a signal to make call to someone ');

            $ws.emit(
              ServerRequestChannels.RTC_CALL_SOMEONE_FOR_LINE,
              new RtcCallRequest(memberId, lineId, signal),
            );

            toast.dismiss(connectingToast);
          });

          // sending back the connection to the parent
          // so that we can accept the answer later on
          handleAddPeer(lineId, memberId, localPeerConnection, localMediaStream);
        });
      });
  });

  return <></>;
}
