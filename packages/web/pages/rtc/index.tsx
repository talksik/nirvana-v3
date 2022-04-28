import { useEffect, useRef, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";

const lines = ["line1", "line2", "line3", "line4", "line5"];

// todo: join different combinations of lines based on page params
// for now, every browser tab/client joins all 5 lines and streams to one specific one

export default function VideoChat() {
  const [selectedLine, setSelectedLine] = useState<string>(lines[0]);
  const videoRef = useRef<HTMLVideoElement>();
  const incomingVideoRef = useRef<HTMLVideoElement>();

  // connect to media server for line connections as a broadcaster and consumer
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((localMediaStream: any) => {
        console.log("localMediaStream", localMediaStream);
        console.log(`tracks: `, localMediaStream.getTracks());

        if (videoRef.current) {
          toast("got local user video stream");
          videoRef.current.srcObject = localMediaStream;
          videoRef.current.play();

          // create a unique peer connection to server for each line
          lines.forEach((lineId) => {
            // create the peer and add the tranceiver
            const peer = createPeer(lineId);

            // console.log(`peer connection for ${lineId}`, peer);

            // todo: understand this better
            // peer.addTransceiver();
            peer.addTransceiver("video", { streams: [localMediaStream] });

            // todo: add other tracks like screenshare and such
            localMediaStream.getTracks().forEach((track: any) => {
              console.log(
                `adding track to peer connection: different mediums | audio, video, screen based on selection`
              );
              // peer.addTrack(track, localMediaStream);
            });
          });
        }
      });
  }, [lines]);

  const createPeer = (lineId: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer, lineId);

    return peer;
  };

  const handleNegotiationNeededEvent = async (
    peer: RTCPeerConnection,
    lineId: string
  ) => {
    console.log("test");

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

    console.log(`got sdp from backend | `, data.data.sdp);

    // receive server acceptance and set remote configs
    const desc = new RTCSessionDescription(data.data.sdp);
    peer.setRemoteDescription(desc).catch((e) => console.log(e));

    console.log(
      `done handling negotiation with media server | remote description: `,
      desc
    );
  };

  // render tracks on the server peer sending something
  // todo: memoize the line so that we can show user where stream is coming from
  const handleTrackEvent = (e: any) => {
    const incomingStream = e.streams[0];

    console.log("incoming stream", incomingStream);

    // if (incomingVideoRef.current) {
    //   console.log(`setting incoming stream ref`);
    //   incomingVideoRef.current.srcObject = incomingStream;
    //   incomingVideoRef.current.load();
    //   incomingVideoRef.current.play();
    // }

    var video = document.getElementById("incomingVideoRef");
    video.srcObject = incomingStream;
    video.onloadedmetadata = function (e) {
      video.play();
    };
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
        muted
        height={"300"}
        width={"300"}
      />

      <video
        ref={incomingVideoRef}
        id="incomingVideoRef"
        height={"500"}
        width={"700"}
      />

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
