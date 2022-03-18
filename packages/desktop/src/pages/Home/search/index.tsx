import { $searchQuery } from "../../../controller/recoil";
import { FaPaperPlane } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { User } from "@nirvana/core/models";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useSearch } from "../../../controller";

// todo:
// remove myself from list
// add friend capability
// unfriend? nahhh not right now

export default function Search() {
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const { data, isLoading, isError, refetch } = useSearch();

  useEffect(() => {
    refetch();
  }, [searchQuery]);

  if (!data?.data?.users) {
    return (
      <span className="text-white">
        no results. please try someone's email or name.
      </span>
    );
  }

  const goBack = () => {
    // implicity takes user back
    setSearchQuery("");
  };

  const renderUserRow = (user: User) => {
    return (
      <span
        className="border-t border-t-slate-400 py-5 flex flex-row justify-start 
      items-center w-full hover:bg-slate-600 cursor-pointer"
      >
        <span className="relative mx-5">
          <img
            src={user.picture}
            className="rounded-lg h-8 hover:bg-slate-200 hover:cursor-pointer hover:scale-110"
            alt=""
          />
          <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
        </span>

        <span className="flex flex-col items-start">
          <span className="text-slate-200 text-lg font-semibold">
            {user.name}
          </span>

          <span className="text-slate-300">{user.email}</span>
        </span>

        {/* actions */}
        <Tooltip title="Request connect">
          <button className="hover:bg-slate-300 p-1 flex flex-row items-center justify-center ml-auto">
            <FaPaperPlane className="text-emerald-500 text-lg" />
          </button>
        </Tooltip>
      </span>
    );
  };

  return (
    <div className="px-5">
      <button
        onClick={goBack}
        className="rounded shadow border border-slate-300 text-slate-300 p-1 my-2"
      >
        Go back
      </button>

      {data?.data?.users?.map((user) => {
        return renderUserRow(user);
      })}
    </div>
  );
}
