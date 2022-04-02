import { $newConvoPage, $searchQuery } from "../../controller/recoil";
import Logo, { LogoType } from "../../components/Logo";

import Conversations from "./conversations";
import Header from "./header";
import NewConvo from "./newConvo";
// import Header from "./header";
import Search from "./search";
// import SelectedConversation from "./selectedConversation";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

export default function Home() {
  // const { data: user } = useGetUserDetails();
  const searchQuery = useRecoilValue($searchQuery);

  const newConvoPage = useRecoilValue($newConvoPage);

  const renderMainContent = () => {
    if (searchQuery) return <Search />;

    if (newConvoPage) return <NewConvo />;

    return <Conversations />;
  };

  return (
    <div className="h-screen bg-zinc-700 flex flex-row">
      <div className="flex-1">
        {/* header */}
        <Header />

        {/*  main content */}

        {/* {renderMainContent()} */}
        <NewConvo />
      </div>

      {/* <SelectedConversation /> */}

      <button></button>
    </div>
  );
}
