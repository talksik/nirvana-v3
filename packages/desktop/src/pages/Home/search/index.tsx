import {
  $searchQuery,
  $selectedConversation,
} from "../../../controller/recoil";

import { FaAngleRight } from "react-icons/fa";
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

  // const { data: userDetails } = useGetUserDetails();

  // const { data, isLoading, isError, refetch } = useSearch();

  useEffect(() => {
    // todo debounce after three seconds and show debounce loading while
    // refetch();
  }, [searchQuery]);

  // if (!data?.users) {
  //   return (
  //     <span className="text-white">
  //       no results. please try someone's email or name.
  //     </span>
  //   );
  // }

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

  return (
    <div className="px-5">
      <button
        onClick={goBack}
        className="rounded shadow border border-zinc-300 text-zinc-300 p-1 my-2"
      >
        Go back
      </button>

      {/* {data?.users?.map((user) => {
        if (user.googleId === userDetails.googleId) return <></>;
        return renderUserRow(user);
      })} */}
    </div>
  );
}
