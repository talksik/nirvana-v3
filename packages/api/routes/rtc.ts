import express, { Application, Request, Response } from "express";

const webrtc = require("wrtc");

export default function getRtcRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  router.post("/join/:lineId", handleJoin);

  return router;
}

// a mapping between a certain line and the streams for it
const linesStreams: {
  [lineId: string]: any[];
} = {};

async function handleJoin(req: Request, res: Response) {
  try {
    const { lineId } = req.params;
    const { sdp } = req.body;

    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // allow this peer connection to receive other peoples' streams
    peer.ontrack = (e: any) => handleStreams(e, peer, lineId);

    // create connection between server and client who hit this endpoint
    const desc = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);

    // now that remote is set
    // allow this peer connection for this specific line to get tracks for this line already
    try {
      const firstStream = linesStreams[lineId] ? linesStreams[lineId][0] : null;
      firstStream?.getTracks().forEach((track: any) => {
        peer.addTrack(track, firstStream);
      });

      // linesStreams[lineId]?.forEach((stream: any) => {
      //   console.log(`have streams in this line`, stream);

      //   stream.getTracks().forEach((track: any) => {
      //     peer.addTrack(track, stream);
      //   });
      // });
    } catch (e) {
      console.log(`hacking around small problem with adding track`, e);
    }

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
      sdp: peer.localDescription,
    };

    res
      .status(200)
      .json({ message: `You can now broadcast to ${lineId}!`, data: payload });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Problem in setting up peer connection with media server",
      error,
    });
  }
}

function handleStreams(e: any, peer: any, lineId: string) {
  // if the room/line exists already, then add to the list of streams
  if (lineId in linesStreams) {
    const newStreamsForLine = [...(linesStreams[lineId] ?? []), e.streams[0]];

    linesStreams[lineId] = newStreamsForLine;
  } else {
    // create a new list of streams
    linesStreams[lineId] = [e.streams[0]];
  }

  console.log(linesStreams);
}
