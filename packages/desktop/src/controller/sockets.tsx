import { useEffect, useState } from "react";

import SocketChannels from "@nirvana/core/sockets/channels";
import { UserStatus } from "../../../core/models/user.model";
import { socket } from "../pages/nirvanaApp";

// import { useGetAllContactBasicDetails } from "./index";

export default function useSocketData() {
  // relationshipId's of the conversations where there is someone speaking
  const [speakingRooms, setSpeakingRooms] = useState<string[]>([]);

  // const { data: allConvosDetsResponse, isFetched } =
  //   useGetAllContactBasicDetails();

  // useEffect(() => {
  //   if (allConvosDetsResponse) {
  //     allConvosDetsResponse.contactsDetails.map((contactDet) => {
  //       // join the right rooms based on the relevant contacts/conversations returned here
  //       socket.emit(
  //         SocketChannels.JOIN_ROOM,
  //         contactDet.relationship._id.toString()
  //       );
  //     });
  //   }
  // }, [isFetched]);

  useEffect(() => {
    socket.on(
      SocketChannels.SEND_STARTED_SPEAKING,
      (relationshipId: string) => {
        console.log(`yayaya someone started speaking in ${relationshipId}!!!!`);

        setSpeakingRooms((prevSpeakingRooms) => [
          ...prevSpeakingRooms,
          relationshipId,
        ]);
      }
    );

    socket.on(
      SocketChannels.SEND_STOPPED_SPEAKING,
      (relationshipId: string) => {
        console.log(`stopped speaking in ${relationshipId}!!!!`);

        setSpeakingRooms((prevSpeakingRooms) =>
          prevSpeakingRooms.filter(
            (relationshipRoomId) => relationshipRoomId !== relationshipId
          )
        );
      }
    );

    socket.on(
      SocketChannels.SEND_AUDIO_CLIP,
      (relationshipId: string, audioChunks: any) => {
        console.log(relationshipId);
        console.log(audioChunks);

        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    );

    socket.on(
      SocketChannels.SEND_USER_STATUS_UPDATE,
      (userGoogleId: string, newStatus: UserStatus) => {
        console.log(`${userGoogleId} updated their status...hmmm`);
      }
    );

    return () => {
      socket.removeAllListeners(SocketChannels.SEND_STARTED_SPEAKING);
      socket.removeAllListeners(SocketChannels.SEND_STOPPED_SPEAKING);
      socket.removeAllListeners(SocketChannels.SEND_AUDIO_CLIP);
      socket.removeAllListeners(SocketChannels.SEND_USER_STATUS_UPDATE);
    };
  }, []);

  // todo: go through all content and add in the socket messages
  // find out which convos have new content for user
  // sort and get rid of duplicate messages for the clip timeline
  // set the latest link for the view component

  // sort the conversations according to this:
  // live -> new messages -> speaking -> incoming requests

  return { speakingRooms };
}
