import { Add, LinkRounded } from "@mui/icons-material";

import { $selectedConversation } from "../../../controller/recoil";
import { Avatar } from "antd";
import { ContactDetails } from "@nirvana/core/responses/getContacts.response";
import { FaVolumeUp } from "react-icons/fa";
import SkeletonLoader from "../../../components/loading/skeleton";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import UserStatusText from "../../../components/User/userStatusText";
import { useGetAllContactBasicDetails } from "../../../controller";
import { useRecoilState } from "recoil";

export default function Conversations() {
  const { data: contactDetailsListResponse, isLoading } =
    useGetAllContactBasicDetails();
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );

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
      {/* actions navbar */}
      <div className="flex justify-end mx-10 mt-5 space-x-3">
        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <LinkRounded className="text-slate-100" fontSize="small" />
        </span>

        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <Add className="text-slate-100" fontSize="small" />
        </span>
      </div>

      {/* pinned conversations */}
      <div className="m-5 p-4 bg-slate-500 shadow-lg rounded">
        <span className="flex flex-row justify-start items-center">
          <FaVolumeUp className="text-red-500" />
          <span className="ml-2 tracking-wider text-slate-100 uppercase text-sm font-semibold">
            Live
          </span>
        </span>

        <span className="text-slate-300">
          Mark Conversations as Pinned to Hear Them Live
        </span>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="flex flex-col m-5 p-4">
          <span className="flex flex-row justify-start items-center mb-2">
            <span className="ml-2 tracking-wider text-slate-100 uppercase text-sm font-semibold">
              Inbox
            </span>
          </span>

          {contactDetailsListResponse?.contactsDetails.map(
            (contactDetail: ContactDetails) => {
              return (
                <div
                  key={contactDetail.relationship._id.toString()}
                  onClick={() =>
                    selectContact(contactDetail.otherUser.googleId)
                  }
                  className="flex flex-row items-center hover:bg-slate-600 group border-t border-t-slate-500
            py-4 px-2 cursor-pointer"
                >
                  <UserAvatarWithStatus user={contactDetail.otherUser} />

                  <span className="text-white font-semibold ml-2">
                    {contactDetail.otherUser.name}
                  </span>

                  <span className="ml-2">
                    <UserStatusText status={contactDetail.otherUser.status} />
                  </span>

                  {contactDetail.isSpeaking ? (
                    <span className="ml-auto">speaking...</span>
                  ) : null}
                </div>
              );
            }
          )}
        </div>
      )}
    </>
  );
}
