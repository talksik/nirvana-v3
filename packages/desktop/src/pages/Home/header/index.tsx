import Logo, { LogoType } from "../../../components/Logo";

import { $searchQuery } from "../../../controller/recoil";
import { useGetUserDetails } from "../../../controller/index";
import { useRecoilState } from "recoil";

export default function Header() {
  const { data: user } = useGetUserDetails();
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  return (
    <div className="flex flex-row items-center bg-slate-800 h-20">
      <Logo type={LogoType.small} className="scale-[0.4]" />
      <input
        placeholder="type / to search"
        className="placeholder:text-slate-400 bg-transparent outline-none text-slate-100"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <button className="ml-auto hover:scale-110 bg-slate-600 text-teal-500 py-1 px-2 rounded-lg text-sm">
        flow state
      </button>

      <span className="relative mx-5">
        <img
          src={user.picture}
          className="rounded-lg h-8 hover:bg-slate-200 hover:cursor-pointer hover:scale-110"
          alt="cannot find"
        />
        <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
      </span>
    </div>
  );
}
