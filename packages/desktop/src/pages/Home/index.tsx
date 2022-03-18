import Logo, { LogoType } from "../../components/Logo";

import { $searchQuery } from "../../controller/recoil";
import Conversations from "./conversations";
import Header from "./header";
import Search from "./search";
import { useEffect } from "react";
import { useGetUserDetails } from "../../controller/";
import { useRecoilValue } from "recoil";

export default function Home() {
  const { data: user } = useGetUserDetails();
  const searchQuery = useRecoilValue($searchQuery);

  return (
    <div className="h-screen w-full bg-slate-700">
      {/* header */}
      <Header />

      {searchQuery ? <Search /> : <Conversations />}
    </div>
  );
}
