import { $authTokens, $searchQuery } from "../../../controller/recoil";
import { Dropdown, Menu } from "antd";
import Logo, { LogoType } from "../../../components/Logo";
import { useRecoilState, useSetRecoilState } from "recoil";

import { GlobalHotKeys } from "react-hotkeys";
import { STORE_ITEMS } from "../../../electron/constants";
import SocketChannels from "@nirvana/core/sockets/channels";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import { UserStatus } from "@nirvana/core/models";
import { socket } from "../../../nirvanaApp";
import { useGetUserDetails } from "../../../controller/index";
import { useRef } from "react";

export default function Header() {
  const { data: userDetailsResponse, isLoading } = useGetUserDetails();
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const inputRef = useRef(null);

  const setAuthTokens = useSetRecoilState($authTokens);

  if (isLoading) {
    return <span>getting data</span>;
  }

  const logOut = () => {
    window.electronAPI.store.set(STORE_ITEMS.GOOGLE_AUTH_TOKENS, null);
    setAuthTokens(null);
  };

  const updateStatus = (newStatus: UserStatus) => {
    // send update in socket
    socket.emit(
      SocketChannels.SEND_USER_STATUS_UPDATE,
      userDetailsResponse.user.status,
      newStatus
    );
  };

  const ProfileMenu = (
    <Menu>
      <Menu.Item key="0">
        <button onClick={logOut}>Log Out</button>
      </Menu.Item>
      <Menu.Item key="1">
        {userDetailsResponse.user.status === UserStatus.ONLINE ? (
          <button onClick={() => updateStatus(UserStatus.OFFLINE)}>
            Set status as away
          </button>
        ) : (
          <button onClick={() => updateStatus(UserStatus.ONLINE)}>
            Set status as online
          </button>
        )}
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

      <div className="flex flex-row items-center bg-zinc-800 h-20 px-5">
        <Logo type={LogoType.small} className="scale-[0.4]" />
        <input
          ref={inputRef}
          placeholder="type / to search"
          className="placeholder:text-zinc-400 bg-transparent outline-none text-zinc-100"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={() => updateStatus(UserStatus.FLOW_STATE)}
          className="ml-auto mr-2 hover:scale-110 bg-zinc-600 text-teal-500 py-1 px-2 rounded-lg text-sm"
        >
          flow state
        </button>

        <Dropdown overlay={ProfileMenu} trigger={["click"]}>
          <span className="px-5">
            {userDetailsResponse?.user && (
              <UserAvatarWithStatus user={userDetailsResponse?.user} />
            )}
          </span>
        </Dropdown>
      </div>
    </>
  );
}
