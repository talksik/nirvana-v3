import { useEffect, useRef, useState } from "react";

import { $maxNumberActiveStreams } from "../../controller/recoil";
import { $numberActiveLines } from "../../controller/recoil";
import GetAllSocketClients from "@nirvana/core/sockets/getAllActiveSocketClients";
import { OVERLAY_ONLY_INITIAL_PRESET } from "../../electron/constants";
import Peer from "simple-peer";
import ReceiveSignal from "@nirvana/core/sockets/receiveSignal";
import SendSignal from "@nirvana/core/sockets/sendSignal";
import SocketChannels from "@nirvana/core/sockets/channels";
import { socket } from "../nirvanaApp";
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
      if (videoRef?.current) videoRef.current.srcObject = remoteStream;
    });
  }, [videoRef]);

  return <video ref={videoRef} controls height={"200"} width="250" autoPlay />;
}

export default function Overlay() {
  /** how many lines have someone broadcasting in them */
  const [numActiveLines, setNumActiveLines] =
    useRecoilState($numberActiveLines);
  const [maxNumActiveStreams, setMaxNumActiveStreams] = useRecoilState(
    $maxNumberActiveStreams
  );

  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  const [peersRefs, setPeersRefs] = useState<
    { peer: Peer; socketUserId: string }[]
  >([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // initially, have these set to default
  useEffect(() => {
    setNumActiveLines(1);
    setMaxNumActiveStreams(1);

    // POC: nirvana all connected users call
    // send signal to all peers through ws

    // I join x room

    // I need to do the work of sending my signal to all others in the room
    //    -> I create a local peer object for my connection to all other people in the room
    //    -> entails me sending my signal data to all other users...

    // the other users will get pinged with my signal data
    //      -> now they have to take that signal data for new x user
    //      and create their local peer object sending their stream to it
    //      and accept/answer the signal after creating this local peer connection between them and the newbie user
    // send back their signal now so that the initiator can get it and accept it

    console.log("socket id", socket.id);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localStream: MediaStream) => {
        // show user video
        if (localVideoRef?.current)
          localVideoRef.current.srcObject = localStream;

        socket.emit(SocketChannels.JOIN_LIVE_ROOM);

        socket.on(
          SocketChannels.GET_ALL_ACTIVE_SOCKET_IDS,
          (data: GetAllSocketClients) => {
            console.log("all socket client connections", data);

            data?.socketIds.map((userSocketId) => {
              if (userSocketId === socket.id) return;

              // need one for each user I want to connect to
              var localPeerInitiator = new Peer({
                initiator: true,
                stream: localStream,
              });

              localPeerInitiator.on("signal", (signal) => {
                console.log(
                  "sending a signal to all users connected and adding local peer object",
                  userSocketId
                );

                // send the local peer-peer signal to other users
                socket.emit(SocketChannels.SEND_SIGNAL, {
                  userSocketIdToSignal: userSocketId,
                  simplePeerSignal: signal,
                } as SendSignal);
              });

              setPeersRefs((prevPeersRefs) => [
                ...prevPeersRefs,
                { peer: localPeerInitiator, socketUserId: userSocketId },
              ]);
            });
          }
        );

        // incoming calls, accept them and send back
        // hits this when I am sending and receiving
        socket.on(SocketChannels.RECEIVE_SIGNAL, (payload: ReceiveSignal) => {
          if (payload.isGoingBackToInitiator) {
            console.log("got back answerers signal");

            // from the list of peers here locally, we want to accept the answers signal
            const localPeerRefToAnswerer = peersRefs.find(
              (peerRef) => peerRef.socketUserId === payload.senderUserSocketId
            );

            localPeerRefToAnswerer.peer.signal(payload.simplePeerSignal);
          } else {
            console.log("ooo newbie joined room, I guess I will accept it ");

            // if we are answering a received signal
            var peerToCallerPeer = new Peer({ initiator: false });

            peerToCallerPeer.on("signal", (signal) => {
              socket.emit(SocketChannels.SEND_SIGNAL, {
                userSocketIdToSignal: payload.senderUserSocketId,
                simplePeerSignal: signal,
                isAnswerer: true,
              } as SendSignal);
            });

            setPeersRefs((prevPeersRefs) => [
              ...prevPeersRefs,
              {
                peer: peerToCallerPeer,
                socketUserId: payload.senderUserSocketId,
              },
            ]);
          }
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error(err);
      });
  }, []);

  // TODO: get all of the toggle tuned in lines and any line that I am toggle broadcasting to
  //    loop through and send lineId to the x child stream overlay components who will do the work

  const addActiveLine = () => {
    setNumActiveLines((prevNum) => prevNum + 1);
  };

  const addAnotherStream = () => {
    setMaxNumActiveStreams((prevNum) => prevNum + 1);
  };

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

      {peersRefs.map((peerRef) => (
        <Video peer={peerRef.peer} />
      ))}
    </div>
  );
}
