import {
  $searchQuery,
  $selectedConversation,
} from "../../../controller/recoil";
import { useGetUserDetails, useSearch } from "../../../controller";

import { FaAngleRight } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import { User } from "@nirvana/core/models";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

// todo:
// remove myself from list
// add friend capability
// unfriend? nahhh not right now

export default function Search() {
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );

  const { data: userDetails } = useGetUserDetails();

  const { data, isLoading, isError, refetch } = useSearch();

  useEffect(() => {
    refetch();
  }, [searchQuery]);

  if (!data?.users) {
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

  const selectContact = async (googleUserId: string) => {
    // if this person is already selected, unselect
    if (selectedConvo === googleUserId) {
      setSelectedConvo(null);
      return;
    }

    setSelectedConvo(googleUserId);
  };

  const renderUserRow = (user: User) => {
    return (
      <span
        key={user.googleId}
        onClick={() => selectContact(user.googleId)}
        className="border-t border-t-zinc-500 py-5 flex flex-row justify-start 
      items-center w-full hover:bg-zinc-600 cursor-pointer group"
      >
        <span className="relative mx-5">
          <img
            src={user.picture}
            className="rounded-lg h-8 hover:bg-zinc-200 hover:cursor-pointer hover:scale-110"
            alt=""
          />
          <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
        </span>

        <span className="flex flex-col items-start">
          <span className="text-zinc-200 text-lg font-semibold">
            {user.name}
          </span>

          <span className="text-zinc-300">{user.email}</span>
        </span>

        {/* actions */}
        <Tooltip title="Request connect">
          <button className="hover:bg-zinc-300 p-1 flex flex-row items-center justify-center ml-auto">
            <FaAngleRight className="group-hover:text-zinc-300 text-lg" />
          </button>
        </Tooltip>
      </span>
    );
  };

  return (
    <div className="px-5">
      <button
        onClick={goBack}
        className="rounded shadow border border-zinc-300 text-zinc-300 p-1 my-2"
      >
        Go back
      </button>

      {data?.users?.map((user) => {
        if (user.googleId === userDetails.googleId) return <></>;
        return renderUserRow(user);
      })}
    </div>
  );
}
