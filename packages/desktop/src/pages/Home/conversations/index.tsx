import { Add, LinkRounded } from "@mui/icons-material";
import { Avatar, Tooltip } from "antd";
import { Tab, Tabs } from "@mui/material";

import { $selectedConversation } from "../../../controller/recoil";
import { ContactDetails } from "@nirvana/core/responses/getContacts.response";
import { FaVolumeUp } from "react-icons/fa";
import SkeletonLoader from "../../../components/loading/skeleton";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import UserStatusText from "../../../components/User/userStatusText";
import { useRecoilState } from "recoil";
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

  const [selectedTab, setSelectedTab] = useState<ConvoTab>(ConvoTab.INBOX);

  const handleChangeTab = (event: any, newTab: ConvoTab) => {
    setSelectedTab(newTab);
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

  return (
    <>
      <div className="flex flex-row justify-between">
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
        >
          <Tab value={ConvoTab.LIVE} label="LIVE" />
          <Tab value={ConvoTab.TUNED} label="TUNED IN" />
          <Tab value={ConvoTab.INBOX} label="INBOX" />
          <Tab value={ConvoTab.REQUESTS} label="REQUESTS" />
        </Tabs>
      </div>

      {/* pinned conversations */}
      <div className="m-5 p-4 bg-zinc-500 shadow-lg rounded">
        <Tooltip title="Listen in like a walkie-talkie.">
          <span className="flex flex-row justify-start items-center cursor-pointer">
            <FaVolumeUp className="text-red-500" />
            <span className="ml-2 tracking-wider text-zinc-100 uppercase text-sm font-semibold">
              Live
            </span>
          </span>
        </Tooltip>
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
