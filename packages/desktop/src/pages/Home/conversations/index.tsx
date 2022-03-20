import { Add, LinkRounded } from "@mui/icons-material";

import { FaVolumeUp } from "react-icons/fa";

export default function Conversations() {
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
    </>
  );
}
