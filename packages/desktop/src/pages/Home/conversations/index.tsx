import { Add, LinkRounded } from "@mui/icons-material";

import { Avatar } from "antd";
import { FaVolumeUp } from "react-icons/fa";
import SkeletonLoader from "../../../components/loading/skeleton";
import { useGetAllContactBasicDetails } from "../../../controller";

export default function Conversations() {
  const { data: contactDetailsListResponse, isLoading } =
    useGetAllContactBasicDetails();

  /** Data we need: have this huge data store client side to be able to access
   * for now, need a simple list of contacts
   * - first list is the live/pinned
   * - second list is the pending invites, out going or incoming? or this on a separate page?
   * - third list is just the rest of my contacts
   *
   * web sockets for all of my active contacts
   * - actually play messages if pinned contact for me
   */

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

      {isLoading ? <SkeletonLoader /> : null}
      <div className="flex flex-col m-5 p-4">
        {contactDetailsListResponse?.contactsDetails.map((contactDetail) => {
          return (
            <div className="flex flex-row items-center">
              <Avatar src={contactDetail.otherUser.picture} />

              <span className="text-white font-semibold ml-2">
                {contactDetail.otherUser.name}
              </span>

              <span className="ml-2">{contactDetail.otherUser.status}</span>

              <span className="ml-auto">speaking...</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
