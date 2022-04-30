import {
  $newConvoPage,
  $selectedConversation,
} from "../../../controller/recoil";
import { Avatar, Tooltip } from "antd";
import {
  Conversation,
  ConversationMemberState,
} from "../../../../../core/models/conversation.model";
import { useRecoilState, useSetRecoilState } from "recoil";

import BasicConversationRow from "../../../components/conversation/basicRow";
import { ContactDetails } from "@nirvana/core/responses/getContacts.response";
import { FaVolumeUp } from "react-icons/fa";
import MasterConversation from "../../../../../core/models/masterConversation.model";
import SkeletonLoader from "../../../components/loading/skeleton";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import UserStatusText from "../../../components/User/userStatusText";
import useSocketData from "../../../controller/sockets";
import { useState } from "react";
import { useUserConvos } from "../../../controller/index";

enum ConvoTab {
  LIVE = "LIVE",
  TUNED = "TUNED",
  INBOX = "INBOX",
  REQUESTS = "REQUESTS",
}
export default function Conversations() {
  // const { data: contactDetailsListResponse, isLoading } =
  //   useGetAllContactBasicDetails();
  const { speakingRooms } = useSocketData();
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );
  const setNewConvoPageTrigger = useSetRecoilState($newConvoPage);

  const [selectedTab, setSelectedTab] = useState<ConvoTab>(ConvoTab.INBOX);

  const handleChangeTab = (event: any, newTab: ConvoTab) => {
    setSelectedTab(newTab);
  };

  const handleNewConvo = () => {
    setNewConvoPageTrigger(true);
  };

  // todo: show conversations with activity/new content for me first...then the rest of the contacts

  const selectContact = async (googleUserId: string) => {
    // if this person is already selected, unselect
    if (selectedConvo === googleUserId) {
      setSelectedConvo(null);
      return;
    }

    setSelectedConvo(googleUserId);
  };

  const { data: userConverstionsData } = useUserConvos();

  // render right content based on selected tab
  const renderConversationContent = () => {
    // if no content for a tab, then show stale text

    const invitedConvos = userConverstionsData?.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.INVITED
    );
    const inboxConvos = userConverstionsData?.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.INBOX
    );
    const tunedConvos = userConverstionsData?.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.TUNED
    );

    const liveConversations = [];

    switch (selectedTab) {
      case ConvoTab.LIVE:
        return (
          <span className="text-center">
            None of your channels are live. Join and chill in a room and it will
            show up here!
          </span>
        );
      case ConvoTab.TUNED:
        if (tunedConvos?.length) {
          return <span>displaying all tuned in convos</span>;
        }
        return <span>Pin a channel to turn it into a walkie talkie.</span>;
      case ConvoTab.INBOX:
        if (inboxConvos?.length) {
          return (
            <>
              {inboxConvos.map((convo) => (
                <BasicConversationRow masterConvo={convo} />
              ))}
            </>
          );
        }
        return <span>Connect with someone and start talking!</span>;
      case ConvoTab.REQUESTS:
        if (invitedConvos?.length) {
          return <span>displaying all request convos</span>;
        }
        return (
          <span>
            No new conversations, connect with someone to get started.
          </span>
        );
    }
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center p-2"></div>

      <div className="flex flex-col items-center">
        {renderConversationContent()}
      </div>

      {/* {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="flex flex-col m-5 p-4">
          {contactDetailsListResponse?.contactsDetails.map(
            (contactDetail: ContactDetails) => {
              const isSelected =
                contactDetail.otherUser.googleId === selectedConvo;

              return (
                <div
                  key={contactDetail.relationship._id.toString()}
                  onClick={() =>
                    selectContact(contactDetail.otherUser.googleId)
                  }
                  className={`flex flex-row items-center hover:bg-zinc-600 group py-4 px-2 cursor-pointer ${
                    isSelected ? "bg-zinc-600" : ""
                  } rounded`}
                >
                  <UserAvatarWithStatus user={contactDetail.otherUser} />

                  <span className="text-white font-semibold ml-2">
                    {contactDetail.otherUser.name}
                  </span>

                  <span className="ml-2">
                    <UserStatusText status={contactDetail.otherUser.status} />
                  </span>

                  {speakingRooms.includes(
                    contactDetail.relationship._id.toString()
                  ) ? (
                    <span className="ml-auto">speaking...</span>
                  ) : null}
                </div>
              );
            }
          )}
        </div>
      )} */}
    </>
  );
}
