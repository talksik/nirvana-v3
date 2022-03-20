import { $authTokens, $searchQuery } from "../../../controller/recoil";
import { Dropdown, Menu } from "antd";
import Logo, { LogoType } from "../../../components/Logo";
import { useRecoilState, useSetRecoilState } from "recoil";

import { STORE_ITEMS } from "../../../electron/constants";
import { useGetUserDetails } from "../../../controller/index";

export default function Header() {
  const { data: user, isLoading } = useGetUserDetails();
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const setAuthTokens = useSetRecoilState($authTokens);

  if (isLoading) {
    return <span>getting data</span>;
  }

  const logOut = () => {
    window.electronAPI.store.set(STORE_ITEMS.AUTH_TOKENS, null);
    setAuthTokens(null);
  };

  const ProfileMenu = (
    <Menu>
      <Menu.Item key="0">
        <button onClick={logOut}>Log Out</button>
      </Menu.Item>
    </Menu>
  );

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

      <Dropdown overlay={ProfileMenu} trigger={["click"]}>
        <span className="relative mx-5">
          <img
            src={user.picture}
            className="rounded-lg h-8 hover:bg-slate-200 hover:cursor-pointer hover:scale-110"
            alt="cannot find"
          />
          <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
        </span>
      </Dropdown>
    </div>
  );
}
