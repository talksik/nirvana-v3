import SocketChannels from "@nirvana/core/sockets/channels";
import { socket } from "../nirvanaApp";
import { useEffect } from "react";
export default function useSocketData() {
  useEffect(() => {
    socket.on(
      SocketChannels.SEND_AUDIO_CLIP,
      (relationshipId: string, audioChunks: any) => {
        console.log(relationshipId);
        console.log(audioChunks);
      }
    );
  }, []);
}
