import React, { useEffect, useContext, useState, useRef, useMemo, useCallback } from 'react';
import Peer from 'simple-peer';
import useAuth from './AuthProvider';
import { useImmer } from 'use-immer';
import useSockets from './SocketProvider';
import {
  RtcReceiveSignalResponse,
  RtcSendSignalRequest,
  ServerRequestChannels,
  ServerResponseChannels,
} from '@nirvana/core/sockets/channels';
import toast from 'react-hot-toast';
import useTerminalProvider from './TerminalProvider';

type PeerMap = {
  [userId: string]: Peer;
};
interface IStreamProvider {
  peerMap: PeerMap;
  userLocalStream?: MediaStream;
}

const StreamProviderContext = React.createContext<IStreamProvider>({
  peerMap: {},
});

export function StreamProvider({ children }: { children: React.ReactChild }) {
  const { roomsMap } = useTerminalProvider();
  const { user } = useAuth();

  const { $ws } = useSockets();

  const [peerMap, updatePeerMap] = useImmer<PeerMap>({});
  const [incomingSignals, updateIncomingSignals] = useImmer<{ [peerUserId: string]: any }>({});

  const [userLocalStream, setUserLocalStream] = useState<MediaStream>();

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

  // on changes of the peer map ("we called someone and created local peer connection"), see if we have an incoming signal
  // and set signal if we have already gotten it and remove from the signals if used
  useEffect(() => {
    if (Object.keys(incomingSignals).length > 0) {
      console.log('going to clear queue of incoming signals');

      Object.entries(peerMap).map(([userId, peer]) => {
        if (incomingSignals[userId]) {
          // ! hack: if they are alphabetically higher, then they are initiator
          if (userId > user._id.toString()) {
            console.log('creating a local peer as the receiver and replacing mine');

            peer.destroy();

            const peerForMeAndNewbie = new Peer({
              initiator: false,
              trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
            });

            peerForMeAndNewbie.signal(incomingSignals[userId]);

            updatePeerMap((draft) => {
              draft[userId] = peerForMeAndNewbie;
            });
          } else {
            console.log('I won, just adding the signal to my local peer with that person');
            peer.signal(incomingSignals[userId]);
          }

          updateIncomingSignals((draft) => {
            delete draft[userId];
          });
        }
      });
    }
  }, [peerMap, incomingSignals, updateIncomingSignals, user, updatePeerMap]);

  useEffect(() => {
    $ws.on(ServerResponseChannels.RTC_RECEIVING_SIGNAL, (res: RtcReceiveSignalResponse) => {
      console.log(`getting signal from someone`, res);

      updateIncomingSignals((draft) => {
        draft[res.senderUserId] = res.simplePeerSignal;
      });
    });

    return () => {
      $ws.removeListener(ServerResponseChannels.RTC_RECEIVING_SIGNAL);
    };
  }, [$ws, updateIncomingSignals]);

  console.log(`peer map: `, peerMap);

  const handleAddPeer = useCallback(
    (userId: string, peerObj: Peer) => {
      updatePeerMap((draft) => {
        draft[userId] = peerObj;
      });
    },
    [updatePeerMap],
  );

  return (
    <StreamProviderContext.Provider value={{ peerMap, userLocalStream }}>
      {/* handles stream connections */}
      <MemoStreamsConnector handleAddPeer={handleAddPeer} membersToCall={distinctPeerUserIds} />

      <div className="flex flex-row gap-5">
        {Object.values(peerMap).map((peer, index) => (
          <StreamPlayer key={`streamPlayer-${index}`} peer={peer} />
        ))}
      </div>

      {children}
    </StreamProviderContext.Provider>
  );
}

export default function useStreams() {
  return useContext(StreamProviderContext);
}

function StreamPlayer({ peer }: { peer: Peer }) {
  const streamRef = useRef<HTMLVideoElement>(null);

  console.log('re-rendering the stream player since peer likely changed', peer);

  useEffect(() => {
    peer.on('stream', (remotePeerStream: MediaStream) => {
      console.log('stream coming in from remote peer');

      console.log(remotePeerStream);

      const audio = new Audio();
      audio.autoplay = true;
      audio.srcObject = remotePeerStream;

      // if (streamRef?.current) streamRef.current.srcObject = remotePeerStream;
    });

    () => peer.destroy();
  }, [peer]);

  return (
    <>
      this is a stream component of one remote peer
      {/* <video ref={streamRef} height={400} width={400} autoPlay muted /> */}
    </>
  );
}

const MemoStreamsConnector = React.memo(StreamsConnector);

function StreamsConnector({
  membersToCall,
  handleAddPeer,
}: {
  membersToCall: string[];
  handleAddPeer: (userId: string, peerObj: Peer) => void;
}) {
  console.log('rendering this piece of shit');
  console.log(membersToCall);

  return (
    <>
      {membersToCall.map((userId) => (
        <StreamConnector key={userId} peerUserId={userId} handleAddPeer={handleAddPeer} />
      ))}
    </>
  );
}

function StreamConnector({
  peerUserId,
  handleAddPeer,
}: {
  peerUserId: string;
  handleAddPeer: (userId: string, peerObj: Peer) => void;
}) {
  const { $ws } = useSockets();

  // call all of the people on the initial load of this
  useEffect(() => {
    console.log('calling all of the initials until this component unmounts');

    setInterval(() => {
      console.log('still have this mediadevice in memory!');
    });

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((localMediaStream: MediaStream) => {
        const localPeerConnection = new Peer({
          initiator: true,
          stream: localMediaStream,
          trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
        });

        localPeerConnection.on('signal', (signal) => {
          console.log('going to call someone');
          $ws.emit(
            ServerRequestChannels.RTC_SEND_SIGNAL,
            new RtcSendSignalRequest(peerUserId, signal),
          );
        });

        // sending back the connection to the parent for everyone
        handleAddPeer(peerUserId, localPeerConnection);
      });

    () => {
      // destroy this peer and remove from the parent controller? or happens when someone else leaves the tuned list?
    };
  }, []);

  return <></>;
}
