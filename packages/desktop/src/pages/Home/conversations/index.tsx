import { Add, LinkRounded, RecordVoiceOverTwoTone } from "@mui/icons-material";
import { Avatar, Tooltip } from "antd";
import { Button, Tab, Tabs } from "@mui/material";

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
      <div className="flex flex-row justify-between p-2">
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

        <Button
          variant="contained"
          color="primary"
          startIcon={<RecordVoiceOverTwoTone />}
          size="small"
          style={{ textTransform: "none" }}
        >
          New
        </Button>
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
