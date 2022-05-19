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
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { useEffectOnce } from 'react-use';

type LinePeerMap = {
  [lineId: string]: { userId: string; peer: Peer }[];
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
      {Object.values(roomsMap).map((line) => {
        if (line.tunedInMemberIds.includes(user._id.toString()))
          return (
            <MemoLineConnector
              key={`streamConnector-${line.lineDetails._id.toString()}`}
              handleAddPeer={handleAddPeer}
              line={line}
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

function LineConnector({
  line,
  handleAddPeer,
}: {
  line: MasterLineData;
  handleAddPeer: (userId: string, peerObj: Peer) => void;
}) {
  console.log('rendering this piece of shit');
  console.log(line);

  useEffectOnce(() => {
    console.log('got initial list for this channel that I am tuned into');

    console.log(line.tunedInMemberIds);
  });

  return (
    <>
      {line.tunedInMemberIds.map((userId) => (
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
