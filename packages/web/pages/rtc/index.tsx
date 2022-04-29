import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";

const lines = ["line1"];

// todo: join different combinations of lines based on page params
// for now, every browser tab/client joins all 5 lines and streams to one specific one

export default function VideoChat() {
  const [selectedLine, setSelectedLine] = useState<string>(lines[0]);
  const videoRef = useRef<HTMLVideoElement>();
  const incomingVideoRef = useRef<HTMLVideoElement>();
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();

  // connect to media server for line connections as a broadcaster and consumer
  useEffect(() => {
    (async () => {
      // note: [later] create a unique peer connection to server for each line
      // lines.forEach((lineId) => {

      // });

      // create the peer and add the tranceiver
      const peer = await createPeer("line1");

      // console.log(`peer connection for ${lineId}`, peer);
    })();
  }, [lines]);

  const createPeer = async (lineId: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    peer.onconnectionstatechange = console.log;

    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer, lineId);
    peer.onicecandidate = console.warn;

    const localMediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log("localMediaStream", localMediaStream);
    console.log(`tracks: `, localMediaStream.getTracks());
    setLocalMediaStream(localMediaStream);

    if (videoRef.current) {
      toast("got local user video stream");
      videoRef.current.srcObject = localMediaStream;

      // todo: add other tracks like screenshare and such
      localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
        console.log(
          `adding track to peer connection: different mediums | audio, video, screen based on selection`
        );
        peer.addTrack(track, localMediaStream);
      });
    }

    peer.addTransceiver("video");
    peer.addTransceiver("audio");

    console.log(peer.getReceivers());
    console.log(peer.getSenders());

    const remoteStream = new MediaStream([
      peer.getSenders()[0].track!,
      peer.getSenders()[1].track!,
    ]);

    // incomingVideoRef.current!.srcObject = remoteStream;

    console.log(peer.connectionState);

    console.log(peer);

    peer.ontrack = handleTrackEvent;

    return peer;
  };

  const handleNegotiationNeededEvent = async (
    peer: RTCPeerConnection,
    lineId: string
  ) => {
    // create offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
    };

    // send offer to server to accept
    const { data } = await axios.post(
      `http://localhost:5000/api/rtc/join/${lineId}`,
      payload
    );

    // receive server acceptance and set remote configs
    const desc = new RTCSessionDescription(data.data.sdp);
    await peer.setRemoteDescription(desc);

    console.log(
      `done handling negotiation with media server | remote description: `,
      desc
    );
  };

  // render tracks on the server peer sending something
  // todo: memoize the line so that we can show user where stream is coming from
  const handleTrackEvent = (e: any) => {
    console.log(e);

    const incomingStream = e.streams[0] as MediaStream;

    console.log("incoming stream", incomingStream.getTracks());

    if (incomingVideoRef.current) {
      toast(`setting incoming stream ref`);
      incomingVideoRef.current.srcObject = new MediaStream([
        e.transceiver.sender.track,
      ]);

      incomingVideoRef.current.oncanplay = () => {
        console.log("cannn PLLLAYY VID!!!!");

        incomingVideoRef.current.play().then(console.log).catch(console.error);
      };

      incomingVideoRef.current.play().then(console.log).catch(console.error);
    }
  };

  return (
    <div className="text-white p-10">
      <h1 className="text-xl">This is a baller video app</h1>

      <ol>
        <li>
          - user joins 5 lines hardcoded lines (stream to and accept any streams
          in those lines)
        </li>
        <li>- user can see which line certain content is coming from</li>
        <li>- user can set medium: share screen or video (along with audio)</li>
        <li>- user can select medium they want to send to</li>
        <li>- user hold tilde to stream selected medium in a specific line</li>
        <li>
          - user can receive transmitted stream content from any line, and see
          which line it's streamed to
        </li>
      </ol>

      <h1 className="text-3xl mt-10">Your Video</h1>
      <span>toggle medium (todo)</span>
      <video
        ref={videoRef}
        id={"userVideo"}
        height={"500"}
        width={"700"}
        muted
        autoPlay
      />

      <video
        ref={incomingVideoRef}
        id="incomingVideoRef"
        height={"500"}
        width={"700"}
        autoPlay
        controls
      />

      <script src="https://meet.jit.si/external_api.js"></script>

      <h1 className="text-3xl mt-10">Select a Line</h1>
      {lines.map((lineId) => (
        <a
          id={`${lineId}-Selection`}
          className={`cursor-pointer p-5 ${
            selectedLine === lineId ? "text-green-400" : "text-white"
          }`}
          onClick={() => setSelectedLine(lineId)}
        >
          {lineId}
        </a>
      ))}

      <h1 className="text-3xl mt-10">
        Hold tilde (`) to stream to `{selectedLine}`
      </h1>
    </div>
  );
}
