import { $authTokens, $searchQuery } from "../../../controller/recoil";
import { Dropdown, Menu } from "antd";
import Logo, { LogoType } from "../../../components/Logo";
import { useRecoilState, useSetRecoilState } from "recoil";

import { GlobalHotKeys } from "react-hotkeys";
import { STORE_ITEMS } from "../../../electron/constants";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import { useGetUserDetails } from "../../../controller/index";
import { useRef } from "react";

export default function Header() {
  const { data: user, isLoading } = useGetUserDetails();
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const inputRef = useRef(null);

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

  // hot keys for selecting search
  const handleSearch = () => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
      setSearchQuery("");
    }
  };

  const keyMap = { START_SEARCH: "/" };
  const handlers = { START_SEARCH: handleSearch };

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap}></GlobalHotKeys>

      <div className="flex flex-row items-center bg-slate-800 h-20 px-5">
        <Logo type={LogoType.small} className="scale-[0.4]" />
        <input
          ref={inputRef}
          placeholder="type / to search"
          className="placeholder:text-slate-400 bg-transparent outline-none text-slate-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="ml-auto mr-2 hover:scale-110 bg-slate-600 text-teal-500 py-1 px-2 rounded-lg text-sm">
          flow state
        </button>

        <Dropdown overlay={ProfileMenu} trigger={["click"]}>
          <span className="px-5">
            <UserAvatarWithStatus user={user} />
          </span>
        </Dropdown>
      </div>
    </>
  );
}
