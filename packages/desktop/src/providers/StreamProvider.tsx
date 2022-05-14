/**
 * take in the rooms
 * which ones am I in
 * on mounting, call all other folks
 *
 * on someone untuning from a line and they are not in any other lines
 * if they are in the peer connections that we have stored, then destroy them and remove them
 *
 * on someone tuning into a line, they are seen in the list of ids for me
 * if they are not in my local peers storage then I want to initiate connections so that I can communicate with them
 *
 *
 * on me untuning from a line, we need to destroy the right one from the store of peers and destroy the connection
 *
 *
 * on me changing my media devices, I need to replace stream for all peer connections so that they get a whole new set
 *
 *
 * listen for any calls to me, as well as any answers back to me
 */

import React, { useEffect, useContext, useState, useRef, useMemo } from 'react';
import Peer from 'simple-peer';
import useRealTimeRooms from './RealTimeRoomProvider';
import useAuth from './AuthProvider';
import { Updater, useImmer } from 'use-immer';
import useSockets from './SocketProvider';
import {
  RtcAnswerRequest,
  RtcCallRequest,
  RtcNewUserResponse,
  RtcReceiveAnswerResponse,
  ServerRequestChannels,
} from '@nirvana/core/sockets/channels';
import { ServerResponseChannels } from '../../../core/sockets/channels';
import toast from 'react-hot-toast';
import { usePrevious } from 'react-use';

type PeerMap = {
  [userId: string]: Peer;
};
interface IStreamProvider {
  peerMap: PeerMap;
}

const StreamProviderContext = React.createContext<IStreamProvider>({
  peerMap: {},
});

export function StreamProvider({ children }: { children: React.ReactChild }) {
  const { roomsMap } = useRealTimeRooms();
  const { user } = useAuth();

  const { $ws } = useSockets();

  const [peerMap, updatePeerMap] = useImmer<PeerMap>({});

  const [userLocalStream, setUserLocalStream] = useState<MediaStream>();
  const localStreamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localMediaStream: MediaStream) => {
        setUserLocalStream(localMediaStream);

        if (localStreamRef.current) localStreamRef.current.srcObject = localMediaStream;
      });
  }, [localStreamRef]);

  useEffect(() => {
    if (userLocalStream) {
      Object.values(peerMap).forEach((currentPeer) => {
        try {
          currentPeer.addStream(userLocalStream);
        } catch (error) {
          toast.error('problem adding stream');
          console.error(error);
        }
      });
    }
  }, [userLocalStream, peerMap]);

  const [distinctPeerUserIds, setDistinctPeerUserIds] = useImmer<string[]>([]);

  useEffect(() => {
    setDistinctPeerUserIds((draft) => {
      Object.values(roomsMap).forEach((line) => {
        if (!line.tunedInMemberIds?.includes(user._id.toString())) {
          return;
        }

        line.tunedInMemberIds.forEach((tunedUserId) => {
          if (tunedUserId === user._id.toString()) return;

          if (draft.includes(tunedUserId)) return;

          draft.push(tunedUserId);
        });
      });
    });
  }, [roomsMap, setDistinctPeerUserIds, user?._id]);

  console.log(`peer map: `, peerMap);

  useEffect(() => {
    $ws.on(
      ServerResponseChannels.RTC_RECEIVING_ANSWER_RESPONSE,
      (res: RtcReceiveAnswerResponse) => {
        console.log(`oooo some master received my call and accepted it ${JSON.stringify(res)}`);

        // find the peer we created earlier for this master
        // ?is this okay? using the setter to get the current state?
        updatePeerMap((draft) => {
          const peerForAnswerer = draft[res.answererUserId];

          if (peerForAnswerer) {
            peerForAnswerer.signal(res.simplePeerSignal);
          } else {
            toast.error('could not find the peer we created before for this master');
          }
        });
      },
    );

    $ws.on(ServerResponseChannels.RTC_NEW_USER_JOINED_RESPONSE, (res: RtcNewUserResponse) => {
      console.log('ooo newbie joined room, I guess I will accept it and send him my signal');

      const peerForMeAndNewbie = new Peer({
        initiator: false,
        trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
      });

      peerForMeAndNewbie.on('signal', (signal) => {
        console.log(
          'as the answerer, I am going to send back my signal so that the newbie can update his local peer for me',
        );
        $ws.emit(
          ServerRequestChannels.RTC_ANSWER_REQUEST,
          new RtcAnswerRequest(res.newUserId, signal),
        );
      });

      peerForMeAndNewbie.signal(res.simplePeerSignal);

      updatePeerMap((draft) => {
        draft[res.newUserId] = peerForMeAndNewbie;
      });
    });

    return () => {
      $ws.removeListener(ServerResponseChannels.RTC_RECEIVING_ANSWER_RESPONSE);
      $ws.removeListener(ServerResponseChannels.RTC_NEW_USER_JOINED_RESPONSE);
    };
  }, [$ws]);

  console.log(`peer map: `, peerMap);

  return (
    <StreamProviderContext.Provider value={{ peerMap }}>
      <div className="flex flex-row">
        <video height={400} width={400} autoPlay muted ref={localStreamRef} />

        <MemoStreamsConnector updatePeerMap={updatePeerMap} membersToCall={distinctPeerUserIds} />
      </div>

      {children}
    </StreamProviderContext.Provider>
  );
}

export default function useStreams() {
  return useContext(StreamProviderContext);
}

const MemoStreamsConnector = React.memo(StreamsConnector);

function StreamsConnector({
  membersToCall,
  updatePeerMap,
}: {
  membersToCall: string[];
  updatePeerMap: Updater<PeerMap>;
}) {
  console.log('rendering this piece of shit');
  console.log(membersToCall);

  return (
    <>
      {membersToCall.map((userId) => (
        <StreamConnector key={userId} peerUserId={userId} updatePeerMap={updatePeerMap} />
      ))}
    </>
  );
}

function StreamConnector({
  peerUserId,
  updatePeerMap,
}: {
  peerUserId: string;
  updatePeerMap: Updater<PeerMap>;
}) {
  const { $ws } = useSockets();

  // call all of the people on the initial load of this
  useEffect(() => {
    console.log('calling all of the initials until this component unmounts');

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localMediaStream: MediaStream) => {
        const localPeerConnection = new Peer({
          initiator: true,
          stream: localMediaStream,
          trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
        });

        localPeerConnection.on('signal', (signal) => {
          console.log('going to call someone');
          $ws.emit(ServerRequestChannels.RTC_CALL_REQUEST, new RtcCallRequest(peerUserId, signal));
        });

        // sending back the connection to the parent for everyone
        updatePeerMap((draft) => {
          draft[peerUserId] = localPeerConnection;
        });
      });

    () => {
      // destroy this peer and remove from the parent controller? or happens when someone else leaves the tuned list?
    };
  }, []);

  return <></>;
}
