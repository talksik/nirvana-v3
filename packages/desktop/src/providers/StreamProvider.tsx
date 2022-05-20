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

const videoConstraints = {
  frameRate: 30,
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

type LineStreamData = {
  localStreamForLine?: MediaStream;
  peerRelations: {
    userId: string;
    peer: Peer;
    peerMediaStream?: MediaStream;
  }[];
};

type LinePeerMap = {
  [lineId: string]: LineStreamData;
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

  const handleGotPeerRemoteStream = useCallback(
    (lineId: string, userId: string, remoteStream: MediaStream) => {
      updatePeerMap((draft) => {
        // for trickling, if we already have a peer for this line and user, then just replace
        const existingUserLinePeerRelation = draft[lineId]?.peerRelations?.find(
          (currPeerRelation) => currPeerRelation.userId === userId,
        );
        if (existingUserLinePeerRelation) {
          existingUserLinePeerRelation.peerMediaStream = remoteStream;
        }
      });
    },
    [updatePeerMap],
  );

  const setLocalStreamForLine = useCallback(
    (lineId: string, localStreamForLine: MediaStream) => {
      updatePeerMap((draft) => {
        draft[lineId] = { ...draft[lineId], localStreamForLine };
      });
    },
    [updatePeerMap],
  );

  const handleAddPeer = useCallback(
    (lineId: string, userId: string, peerObj: Peer) => {
      updatePeerMap((draft) => {
        // for trickling, if we already have a peer for this line and user, then just replace
        const existingUserLinePeerRelation = draft[lineId]?.peerRelations?.find(
          (currPeerRelation) => currPeerRelation.userId === userId,
        );
        if (existingUserLinePeerRelation) {
          return draft;
        }

        if (draft[lineId]?.peerRelations) {
          draft[lineId].peerRelations.push({ userId, peer: peerObj });
        } else {
          draft[lineId] = { ...draft[lineId], peerRelations: [{ userId, peer: peerObj }] };
        }
      });
    },
    [updatePeerMap],
  );

  useEffect(() => {
    $ws.on(ServerResponseChannels.RTC_NEW_USER_JOINED, (res: RtcNewUserJoinedResponse) => {
      toast.success('NEWBIE JOINED!!!');
      console.log('someone calling me', res);

      const peerForMeAndNewbie = new Peer({
        initiator: false,
        trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
        stream: peerMap[res.lineId]?.localStreamForLine,
        config: {
          iceServers,
        },
      });

      peerForMeAndNewbie.signal(res.simplePeerSignal);

      handleAddPeer(res.lineId, res.userWhoCalled, peerForMeAndNewbie);

      // make sure this peer gets destroyed to remove this listener
      peerForMeAndNewbie.on('signal', (signal) => {
        console.log('sending an answer to the slave', res);

        $ws.emit(
          ServerRequestChannels.RTC_ANSWER_SOMEONE_FOR_LINE,
          new RtcAnswerSomeoneRequest(res.userWhoCalled, res.lineId, signal),
        );
      });

      peerForMeAndNewbie.on('stream', (remoteStream: MediaStream) => {
        handleGotPeerRemoteStream(res.lineId, res.userWhoCalled, remoteStream);
      });
    });

    $ws.on(ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER, (res: RtcReceiveAnswerResponse) => {
      toast.success('MASTER gave me an answer!!!');

      console.log('master gave me this answer: ', res);

      // find this person in peer map
      updatePeerMap((draft) => {
        const localPeerForMasterAndMe = draft[res.lineId]?.peerRelations?.find(
          (currPeerRelationship) => currPeerRelationship.userId === res.masterUserId,
        );

        if (localPeerForMasterAndMe) localPeerForMasterAndMe.peer.signal(res.simplePeerSignal);
      });
    });

    return () => {
      $ws.removeAllListeners(ServerResponseChannels.RTC_NEW_USER_JOINED);
      $ws.removeAllListeners(ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER);
    };
  }, [updatePeerMap, $ws, userLocalStream, peerMap, handleGotPeerRemoteStream, handleAddPeer]);

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
      .getUserMedia({
        video: videoConstraints,
        audio: true,
      })
      .then((localMediaStream: MediaStream) => {
        setUserLocalStream(localMediaStream);
      });
  }, []);

  console.log(`peer map: `, peerMap);

  // manage untuning including myself
  useEffect(() => {
    const tunedUsersForLines: { [lineId: string]: string[] } = {};
    Object.values(roomsMap).map((currentLine) => {
      if (currentLine.tunedInMemberIds)
        tunedUsersForLines[currentLine.lineDetails._id.toString()] = currentLine.tunedInMemberIds;
    });

    updatePeerMap((draft) => {
      // go through peer map
      // if there is someone in it who is not in a tuned in line, then destroy peer and remove
      Object.entries(draft).map(([lineId, lineStreamData]) => {
        // if I left this channel, then I want to make sure to destroy and delete all relations
        if (
          roomsMap[lineId]?.tunedInMemberIds &&
          !roomsMap[lineId]?.tunedInMemberIds.includes(user._id.toString())
        ) {
          lineStreamData?.peerRelations.forEach((peerRelation) => {
            peerRelation.peer.destroy();
          });

          delete draft[lineId];
          return;
        }

        const usersToRemove = [];
        lineStreamData?.peerRelations?.forEach((peerRelation) => {
          if (!tunedUsersForLines[lineId].includes(peerRelation.userId)) {
            peerRelation.peer.destroy();

            usersToRemove.push(peerRelation.userId);
          }
        });

        draft[lineId].peerRelations = draft[lineId]?.peerRelations?.filter(
          (peerRelation) => !usersToRemove.includes(peerRelation.userId),
        );
      });
    });
  }, [roomsMap, updatePeerMap, user]);

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
              handleGotPeerRemoteStream={handleGotPeerRemoteStream}
              setLocalStreamForLine={setLocalStreamForLine}
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
  handleGotPeerRemoteStream,
  setLocalStreamForLine,
}: {
  lineId: string;
  membersToCall: string[];
  handleAddPeer: (lineId: string, userId: string, peerObj: Peer) => void;
  setLocalStreamForLine: (lineId: string, localStreamForLine: MediaStream) => void;
  handleGotPeerRemoteStream: (lineId: string, userId: string, remoteStream: MediaStream) => void;
}) {
  const { $ws } = useSockets();

  console.log('rendering this piece of shit');

  useEffectOnce(() => {
    console.log('got initial list for this channel that I am tuned into');

    console.log(membersToCall);

    // todo get the user media selections

    // todo check if already in peer map? keeping it simple for now
    // a peer relationship between me and someone for this particular channel so that I can just enable or disable this particular stream
    // object instead of managing different ones

    // bandwidth wise, would be uploading stream to one room at a time but downloading a x b streams but someone can't
    // stream in two at same time anyway

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((localMediaStream: MediaStream) => {
        setLocalStreamForLine(lineId, localMediaStream);

        toast.success('CALLING bunch of people!!!');
        console.log('Calling these folks', membersToCall);
        console.log('for line', lineId);

        // todo...call in parallel
        membersToCall.map((memberId) => {
          const connectingToast = toast.loading('calling peer for a snappy experience');

          // make sure this peer gets destroyed when it's time to remove this listener
          const localPeerConnection = new Peer({
            initiator: true,
            stream: localMediaStream,
            trickle: true, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times,
            config: {
              iceServers,
            },
          });

          localPeerConnection.on('signal', (signal) => {
            console.log('have a signal to make call to someone ');

            $ws.emit(
              ServerRequestChannels.RTC_CALL_SOMEONE_FOR_LINE,
              new RtcCallRequest(memberId, lineId, signal),
            );

            toast.dismiss(connectingToast);

            // sending back the connection to the parent
            // so that we can accept the answer later on
            handleAddPeer(lineId, memberId, localPeerConnection);
          });

          localPeerConnection.on('stream', (remoteStream: MediaStream) => {
            handleGotPeerRemoteStream(lineId, memberId, remoteStream);
          });
        });
      });
  });

  return <></>;
}
