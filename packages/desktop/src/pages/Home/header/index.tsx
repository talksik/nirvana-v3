import { $jwtToken, $searchQuery } from "../../../controller/recoil";
import {
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuProps,
} from "@mui/material";
import { Check, Logout } from "@mui/icons-material";
import Logo, { LogoType } from "../../../components/Logo";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useRef, useState } from "react";

import { GlobalHotKeys } from "react-hotkeys";
import SocketChannels from "@nirvana/core/sockets/channels";
import UserAvatarWithStatus from "../../../components/User/userAvatarWithStatus";
import { UserStatus } from "@nirvana/core/models";
import { socket } from "../../../nirvanaApp";
import { useGetUserDetails } from "../../../controller/index";

export default function Header() {
  const { data: userDetailsResponse, isLoading } = useGetUserDetails();
  const [searchQuery, setSearchQuery] = useRecoilState($searchQuery);

  const setJwtToken = useSetRecoilState($jwtToken);

  const inputRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const openAvatarMenu = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return <span>getting data</span>;
  }

  const logOut = () => {
    console.log("logging out!");
    setJwtToken(undefined);
  };

  const updateStatus = (newStatus: UserStatus) => {
    // send update in socket
    socket.emit(
      SocketChannels.SEND_USER_STATUS_UPDATE,
      userDetailsResponse.user.status,
      newStatus
    );
  };

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

        <span className="px-5" onClick={handleClick}>
          {userDetailsResponse?.user && (
            <UserAvatarWithStatus user={userDetailsResponse?.user} />
          )}
        </span>
      </div>

      <Menu
        anchorEl={anchorEl as Element}
        id="account-menu"
        open={openAvatarMenu}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => updateStatus(UserStatus.ONLINE)}>
          <ListItemIcon>
            <Check fontSize="small" />
          </ListItemIcon>
          Online
        </MenuItem>
        <MenuItem onClick={() => updateStatus(UserStatus.OFFLINE)}>
          <ListItemIcon>
            <Check fontSize="small" />
          </ListItemIcon>
          Away
        </MenuItem>
        <MenuItem onClick={() => updateStatus(UserStatus.FLOW_STATE)}>
          <ListItemIcon>
            <Check fontSize="small" />
          </ListItemIcon>
          Flow State
        </MenuItem>

        <Divider />

        <MenuItem onClick={logOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
