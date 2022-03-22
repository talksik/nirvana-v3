import { FaMicrophone, FaPlay, FaWindowClose } from "react-icons/fa";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import {
  Querytypes,
  useConversationDetails,
  useGetUserDetails,
  useSendContactRequest,
  useUpdateRelationshipState,
} from "../../../controller";
import { useEffect, useState } from "react";

import { $selectedConversation } from "../../../controller/recoil";
import { Dimensions } from "../../../electron/constants";
import { RelationshipState } from "@nirvana/core/models/relationship.model";
import SocketChannels from "@nirvana/core/sockets/channels";
import UpdateRelationshipStateRequest from "@nirvana/core/requests/updateRelationshipState.request";
import UserStatusText from "../../../components/User/userStatusText";
import moment from "moment";
import { queryClient } from "../../../nirvanaApp";
import { socket } from "../../../nirvanaApp";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";

var audioChunks: any = [];

export default function SelectedConversation() {
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );
  const { data: userDetailsData } = useGetUserDetails();
  const { data: convoDetailsResponse, isFetching } =
    useConversationDetails(selectedConvo);
  const { mutate: sendContactRequest } = useSendContactRequest();
  const { mutate: updateRelationshipState } = useUpdateRelationshipState();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const [hasMicPermissions, sethasMicPermissions] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

  // audio handling
  // setting up recording permissions
  useEffect(() => {
    try {
      // checking for permissions for recording
      // won't work in https!!!
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorder);

          console.log("Permission Granted");
          sethasMicPermissions(true);
        })
        .catch((e) => {
          console.log("Permission Denied");
          toast.error(
            "Please make sure that you have connected a microphone and given permissions."
          );
          sethasMicPermissions(false);
        });
    } catch (error) {
      console.log(error);
      toast.error("something went wrong");
    }
  }, []);

  // todo: hacky way of re-linking event listeners once we have the relationship id
  useEffect(() => {
    if (mediaRecorder && convoDetailsResponse) {
      mediaRecorder.addEventListener(
        "dataavailable",
        mediaRecorderDataAvailable
      );
      mediaRecorder.addEventListener("stop", mediaRecorderStop);
    }
  }, [mediaRecorder, convoDetailsResponse]);

  const mediaRecorderDataAvailable = (event: any) => {
    audioChunks.push(event.data);
  };

  const mediaRecorderStop = () => {
    socket.emit(
      SocketChannels.SEND_AUDIO_CLIP,
      convoDetailsResponse.ourRelationship._id.toString(),
      audioChunks
    );

    const audioBlob = new Blob(audioChunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    audioChunks = [];
  };

  useEffect(() => {
    // if selected, then change the bounds of this window as well
    if (selectedConvo) {
      window.electronAPI.window.resizeWindow(Dimensions.selectedConvo);
    } else {
      // change bounds back
      window.electronAPI.window.resizeWindow(Dimensions.default);
    }
  }, [selectedConvo]);

  // if no convo selected, don't show this
  if (!selectedConvo) {
    return <></>;
  }

  if (isFetching) {
    return <span className="text-slate-200">Loading conversation details</span>;
  }

  // todo: add cancel request option

  const sendRequest = () => {
    const otherUserGoogleId = convoDetailsResponse.contactUser.googleId;

    // todo mutation to create a user
    sendContactRequest(otherUserGoogleId, {
      onSettled: (data, error) => {
        return queryClient.invalidateQueries(
          Querytypes.GET_CONVERSATION_DETAILS + "/" + otherUserGoogleId
        );
      },
    });
  };

  const acceptRequest = () => {
    const otherUserGoogleId = convoDetailsResponse.contactUser.googleId;

    updateRelationshipState(
      new UpdateRelationshipStateRequest(
        convoDetailsResponse.ourRelationship._id,
        RelationshipState.ACTIVE
      ),
      {
        onSettled: (data, error) => {
          return queryClient.invalidateQueries(
            Querytypes.GET_CONVERSATION_DETAILS + "/" + otherUserGoogleId
          );
        },
      }
    );
  };

  if (isFetching) return <span>Please wait</span>;

  const renderMainContent = () => {
    // if there's no relationship, then don't show messages, show "send request" button
    if (!convoDetailsResponse?.ourRelationship) {
      return <button onClick={sendRequest}>Send Request</button>;
    }

    // if the relationship is pending and I am the receiver, then I should see an accept or deny button
    if (
      convoDetailsResponse.ourRelationship.state ===
        RelationshipState.PENDING &&
      userDetailsData.googleId ===
        convoDetailsResponse.ourRelationship.receiverUserId
    ) {
      return (
        <span>
          please accept this request by clicking here:{" "}
          <button onClick={acceptRequest}>accept</button>
        </span>
      );
    }

    // when i sent a request to this person, just tell me that I have to wait
    if (
      convoDetailsResponse.ourRelationship.state ===
        RelationshipState.PENDING &&
      userDetailsData.googleId ===
        convoDetailsResponse.ourRelationship.senderUserId
    ) {
      return <span>Waiting on request to be accepted</span>;
    }

    if (
      convoDetailsResponse.ourRelationship.state === RelationshipState.ACTIVE
    ) {
      return <span>this is all of the content</span>;
    }

    if (
      convoDetailsResponse.ourRelationship.state === RelationshipState.DENIED
    ) {
      return <span>this request was denied</span>;
    }
  };

  const startRecording = async () => {
    socketStartedSpeaking();
    setIsRecording(true);

    mediaRecorder.start();
  };

  const stopRecording = () => {
    socketStopSpeaking();
    setIsRecording(false);

    mediaRecorder.stop();
  };

  // emit to room/conversation that someone started speaking
  const socketStartedSpeaking = () => {
    // send the room name and the update type

    // only send if we are in a relationship
    if (convoDetailsResponse.ourRelationship._id.toString())
      socket.emit(
        SocketChannels.SEND_STARTED_SPEAKING,
        convoDetailsResponse.ourRelationship._id.toString()
      );
  };

  const socketStopSpeaking = () => {
    // send the room name and the update type

    // only send if we are in a relationship
    if (convoDetailsResponse.ourRelationship._id.toString())
      socket.emit(
        SocketChannels.SEND_STOPPED_SPEAKING,
        convoDetailsResponse.ourRelationship._id.toString()
      );
  };

  // hot keys for closing this window
  const handleClose = () => {
    setSelectedConvo(null);
  };
  const keyMap: KeyMap = {
    CLOSE_SELECTED_CONVO: "esc",
    START_RECORDING: {
      name: "START RECORDING",
      sequence: "r",
      action: "keydown",
    },
    STOP_RECORDING: {
      name: "STOP RECORDING",
      sequence: "r",
      action: "keyup",
    },
  };
  const handlers = {
    CLOSE_SELECTED_CONVO: handleClose,
    START_RECORDING: startRecording,
    STOP_RECORDING: stopRecording,
  };

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} />

      <div className="bg-slate-800 flex-1 flex flex-col relative">
        {/* close marker */}
        <FaWindowClose
          onClick={handleClose}
          className="text-slate-400 text-xl hover:text-slate-200 hover:scale-110 absolute top-0 right-0 m-1 cursor-pointer"
        />

        {/* top header/profile information */}
        <span className="flex flex-row justify-start items-center p-2">
          <img
            className="rounded"
            src={convoDetailsResponse.contactUser.picture}
          />
          <span className="flex flex-col items-start pl-2">
            <span className="flex flex-row space-x-2 items-center">
              <span className="text-white font-semibold text-lg">
                {convoDetailsResponse.contactUser.name}
              </span>
              <UserStatusText
                status={convoDetailsResponse.contactUser.status}
              />
            </span>

            <span className="text-slate-300 text-sm">{`joined ${moment(
              convoDetailsResponse.contactUser.createdDate
            ).fromNow()}`}</span>
          </span>
        </span>

        {renderMainContent()}

        <span className="flex flex-row my-5 items-center justify-center space-x-5">
          <span className="flex flex-row justify-center items-center p-1 rounded shadow-lg h-10 w-10 bg-slate-500 cursor-pointer">
            {isRecording ? (
              <FaMicrophone className="text-red-600 text-xl animate-pulse" />
            ) : (
              <FaMicrophone className="text-red-600 text-lg" />
            )}
          </span>

          <span className="flex flex-row justify-center items-center p-1 rounded shadow-lg h-10 w-10 bg-slate-500 cursor-pointer">
            <FaPlay className="text-blue-600 text-lg" />
          </span>
        </span>
      </div>
    </>
  );
}
