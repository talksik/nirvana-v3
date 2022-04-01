import Logo, { LogoType } from "../../components/Logo";

import { $searchQuery } from "../../controller/recoil";
import Conversations from "./conversations";
// import Header from "./header";
import Search from "./search";
// import SelectedConversation from "./selectedConversation";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

export default function Home() {
  // const { data: user } = useGetUserDetails();
  const searchQuery = useRecoilValue($searchQuery);

  return (
    <div className="h-screen bg-zinc-700 flex flex-row">
      <div className="flex-1">
        {/* header */}
        {/* <Header /> */}

        {/*  main content */}

        {searchQuery ? <Search /> : <Conversations />}
      </div>

      {/* <SelectedConversation /> */}

      <button></button>
    </div>
  );
}
