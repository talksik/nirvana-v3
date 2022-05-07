import { useCallback, useEffect, useRef, useState } from "react";

import { $maxNumberActiveStreams } from "../../controller/recoil";
import { $numberActiveLines } from "../../controller/recoil";
import GetAllSocketClients from "@nirvana/core/sockets/getAllActiveSocketClients";
import { OVERLAY_ONLY_INITIAL_PRESET } from "../../electron/constants";
import Peer from "simple-peer";
import ReceiveSignal from "@nirvana/core/sockets/receiveSignal";
import SendSignal from "@nirvana/core/sockets/sendSignal";
import SocketChannels from "@nirvana/core/sockets/channels";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";

/**
 * @returns a video component with the stream of the peer provided
 * @param peer : Peer connection that is established
 */
function Video({ peer }: { peer: Peer }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (remoteStream: MediaStream) => {
      console.log("stream coming in, adding video src object");

      if (videoRef?.current) videoRef.current.srcObject = remoteStream;

      // check if other user muted
      setInterval(() => {
        const videoAvailabe = remoteStream
          .getVideoTracks()
          .find((track) => track.enabled);

        if (!videoAvailabe) console.log("someone muted!!! ooo");
      }, 2000);
    });

    peer.on("close", () => {
      console.log("remote user closed mediaconnection");
      videoRef.current.height = 0;
    });
  }, [videoRef]);

  return (
    <video ref={videoRef} controls height={"200"} width="250" autoPlay muted />
  );
}

export default function Overlay() {
  /** how many lines have someone broadcasting in them */
  const [numActiveLines, setNumActiveLines] =
    useRecoilState($numberActiveLines);
  const [maxNumActiveStreams, setMaxNumActiveStreams] = useRecoilState(
    $maxNumberActiveStreams
  );

  // all of the peer connections to all people this client is connecting to
  const [localPeerConnections, setLocalPeerConnections] = useState<Peer[]>([]);

  const peersRefs = useRef<{ peer: Peer; socketUserId: string }[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [localUserVideoStream, setLocalUserVideoStream] =
    useState<MediaStream>(null);

  // initially, have these set to default
  // useEffect(() => {
  //   // POC: nirvana all connected users call
  //   // send signal to all peers through ws

  //   // I join x room

  //   // I need to do the work of sending my signal to all others in the room
  //   //    -> I create a local peer object for my connection to all other people in the room
  //   //    -> entails me sending my signal data to all other users...

  //   // the other users will get pinged with my signal data
  //   //      -> now they have to take that signal data for new x user
  //   //      and create their local peer object sending their stream to it
  //   //      and accept/answer the signal after creating this local peer connection between them and the newbie user
  //   // send back their signal now so that the initiator can get it and accept it

  //   console.log("socket id", socket.id);

  //   navigator.mediaDevices
  //     .getUserMedia({ video: false, audio: true })
  //     .then((localStream: MediaStream) => {
  //       setLocalUserVideoStream(localStream);

  //       // show user video
  //       if (localVideoRef?.current)
  //         localVideoRef.current.srcObject = localStream;

  //       socket.emit(SocketChannels.JOIN_LIVE_ROOM);

  // would already have all of the tuned in sockets in array
  // then create a peer for each...tell others to create also because they would have received
  // "SOMEONE_TUNED_INTO_LINE"

  // need a peer connection with every userId in the list of tunedInFolks so that when it comes time to broadcast
  // it's super simple in that we just start playing the stream from the appropriate peer who is associated with the correct userId
  // small validation to consider is that the broadcasterUserIds are in the list of tunedInUserIds

  //       socket.on(
  //         SocketChannels.GET_ALL_ACTIVE_SOCKET_IDS,
  //         (data: GetAllSocketClients) => {
  //           console.log("all socket client connections", data);

  //           const peers = [];
  //           data?.socketIds.map((userSocketId) => {
  //             if (userSocketId === socket.id) return;

  //             // need one for each user I want to connect to
  //             var localPeerInitiator = new Peer({
  //               initiator: true,
  //               stream: localStream,
  //               trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
  //             });

  //             localPeerInitiator.on("signal", (signal) => {
  //               console.log(
  //                 "created local initiator peer and sending signal to: ",
  //                 userSocketId
  //               );

  //               // send the local peer-peer signal to other users
  //               socket.emit(SocketChannels.SEND_SIGNAL, {
  //                 userSocketIdToSignal: userSocketId,
  //                 simplePeerSignal: signal,
  //                 isAnswerer: false,
  //               } as SendSignal);
  //             });

  //             peersRefs.current.push({
  //               peer: localPeerInitiator,
  //               socketUserId: userSocketId,
  //             });

  //             peers.push(localPeerInitiator);
  //           });

  //           setLocalPeerConnections(peers);
  //         }
  //       );

  //       // incoming calls, accept them and send back
  //       // hits this when I am sending and receiving
  //       socket.on(SocketChannels.RECEIVE_SIGNAL, (payload: ReceiveSignal) => {
  //         if (payload.isGoingBackToInitiator) {
  //           // from the list of peers here locally, we want to accept the answers signal
  //           const localPeerRefToAnswerer = peersRefs.current.find(
  //             (peerRef) => peerRef.socketUserId === payload.senderUserSocketId
  //           );

  //           console.log(
  //             "got back answerers signal, going to signal the right peer now: ",
  //             localPeerRefToAnswerer
  //           );

  //           localPeerRefToAnswerer.peer.signal(payload.simplePeerSignal);
  //         } else {
  //           console.log("ooo newbie joined room, I guess I will accept it ");

  //           // if we are answering a received signal
  //           var peerToCallerPeer = new Peer({
  //             initiator: false,
  //             trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
  //             stream: localStream,
  //           });

  //           peerToCallerPeer.on("signal", (signal) => {
  //             console.log(
  //               "as the answerer, I am going to send back my signal so that the newbie can update his local peer for me"
  //             );
  //             socket.emit(SocketChannels.SEND_SIGNAL, {
  //               userSocketIdToSignal: payload.senderUserSocketId,
  //               simplePeerSignal: signal,
  //               isAnswerer: true,
  //             } as SendSignal);
  //           });

  //           peerToCallerPeer.signal(payload.simplePeerSignal);

  //           peersRefs.current.push({
  //             peer: peerToCallerPeer,
  //             socketUserId: payload.senderUserSocketId,
  //           });

  //           setLocalPeerConnections((prevPeers) => [
  //             ...prevPeers,
  //             peerToCallerPeer,
  //           ]);
  //         }
  //       });
  //     })
  //     .catch((err: Error) => {
  //       console.error(err);
  //       toast.error(err.message);
  //     });
  // }, []);

  // TODO: get all of the toggle tuned in lines and any line that I am toggle broadcasting to
  //    loop through and send lineId to the x child stream overlay components who will do the work

  const addActiveLine = () => {
    setNumActiveLines((prevNum) => prevNum + 1);
  };

  const addAnotherStream = () => {
    setMaxNumActiveStreams((prevNum) => prevNum + 1);
  };

  // handle shortcut to enable this stream if this video component is selected
  const toggleMyStreamOnOrOff = useCallback(() => {
    localUserVideoStream
      .getTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  }, [localUserVideoStream]);

  return (
    <div className="flex flex-col max-w-sm">
      {/* {[...Array(maxNumActiveStreams)].map((_n) => (
        <img
          className="w-fit"
          src="https://miro.medium.com/max/1200/1*hONz6Wttkst4FUp_0hwQJQ.png"
        />
      ))}

      <button onClick={addActiveLine}>add column</button>
      <button onClick={addAnotherStream}>add row</button> */}

      <video muted id="userLocalVideo" ref={localVideoRef} controls autoPlay />

      <button onClick={toggleMyStreamOnOrOff}>Toggle My Stream</button>

      {localPeerConnections.map((peer) => (
        <Video peer={peer} />
      ))}
    </div>
  );
}
