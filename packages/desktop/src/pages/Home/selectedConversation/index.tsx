import {
  Querytypes,
  useConversationDetails,
  useGetUserDetails,
  useSendContactRequest,
  useUpdateRelationshipState,
} from "../../../controller";

import { $selectedConversation } from "../../../controller/recoil";
import { Dimensions } from "../../../electron/constants";
import { FaWindowClose } from "react-icons/fa";
import { GlobalHotKeys } from "react-hotkeys";
import { RelationshipState } from "@nirvana/core/models/relationship.model";
import UpdateRelationshipStateRequest from "@nirvana/core/requests/updateRelationshipState.request";
import moment from "moment";
import { queryClient } from "../../../nirvanaApp";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

export default function SelectedConversation() {
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );
  const { data: userDetailsData } = useGetUserDetails();
  const { data: convoDetailsResponse, isFetching } =
    useConversationDetails(selectedConvo);
  const { mutate: sendContactRequest } = useSendContactRequest();
  const { mutate: updateRelationshipState } = useUpdateRelationshipState();

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

  // hot keys for closing this window
  const handleClose = () => {
    setSelectedConvo(null);
  };
  const keyMap = { CLOSE_SELECTED_CONVO: "esc" };
  const handlers = { CLOSE_SELECTED_CONVO: handleClose };

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap}></GlobalHotKeys>

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
            <span className="flex flex-row space-x-2">
              <span className="text-white font-semibold text-lg">
                {convoDetailsResponse.contactUser.name}
              </span>
              <span className="text-emerald-500 text-sm">
                {convoDetailsResponse.contactUser.status}
              </span>
            </span>

            <span className="text-slate-300 text-sm">{`joined ${moment(
              convoDetailsResponse.contactUser.createdDate
            ).fromNow()}`}</span>
          </span>
        </span>

        {renderMainContent()}
      </div>
    </>
  );
}
