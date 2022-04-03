import {
  $newConvoPage,
  $selectedConversation,
} from "../../../controller/recoil";
import { Add, LinkRounded, RecordVoiceOverTwoTone } from "@mui/icons-material";
import { Avatar, Tooltip } from "antd";
import { Button, Fab, Tab, Tabs } from "@mui/material";
import {
  Conversation,
  ConversationMemberState,
} from "../../../../../core/models/conversation.model";
import { useRecoilState, useSetRecoilState } from "recoil";

import { ContactDetails } from "@nirvana/core/responses/getContacts.response";
import { FaVolumeUp } from "react-icons/fa";
import MasterConversation from "../../../../../core/models/masterConversation.model";
import SkeletonLoader from "../../../components/loading/skeleton";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import UserStatusText from "../../../components/User/userStatusText";
import useSocketData from "../../../controller/sockets";
import { useState } from "react";

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

  // fake data of conversations
  const allMasterConvos = [] as MasterConversation[];

  // render right content based on selected tab
  const renderConversationContent = () => {
    // if no content for a tab, then show stale text

    const invitedConvos = allMasterConvos.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.INVITED
    );
    const inboxConvos = allMasterConvos.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.INBOX
    );
    const tunedConvos = allMasterConvos.filter(
      (masterConvo) =>
        masterConvo.currentUserMember.state === ConversationMemberState.TUNED
    );

    const liveConversations = [];

    switch (selectedTab) {
      case ConvoTab.LIVE:
        return (
          <span>
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
          return <span>displaying all inbox convos</span>;
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
      <div className="flex flex-row justify-between items-center p-2">
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
          sx={{ textTransform: "none" }}
        >
          <Tab value={ConvoTab.LIVE} label="LIVE" sx={{ fontSize: "0.75em" }} />
          <Tab
            value={ConvoTab.TUNED}
            label="TUNED IN"
            sx={{ fontSize: "0.75em" }}
          />
          <Tab
            value={ConvoTab.INBOX}
            label="INBOX"
            sx={{ fontSize: "0.75em" }}
          />
          <Tab
            value={ConvoTab.REQUESTS}
            label="REQUESTS"
            sx={{ fontSize: "0.75em" }}
          />
        </Tabs>

        <Fab
          variant="extended"
          size="small"
          color="primary"
          aria-label="add"
          onClick={handleNewConvo}
          style={{ textTransform: "none" }}
        >
          <RecordVoiceOverTwoTone fontSize="small" sx={{ mr: 1 }} />
          new
        </Fab>
      </div>

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
