import { $jwtToken, $searchQuery } from "../../../controller/recoil";
import {
  Avatar,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuProps,
} from "@mui/material";
import { Check, Logout } from "@mui/icons-material";
import Logo, { LogoType } from "../../../components/Logo";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

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

  const [userVideo, setUserVideo] = useState<any>(null);

  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then((localMediaStream: any) => {
  //       console.log(localMediaStream);

  //       setUserVideo(localMediaStream);

  //       var video = document.querySelector("video");
  //       video.srcObject = localMediaStream;
  //       video.onloadedmetadata = function (e) {
  //         video.play();
  //       };

  //       setTimeout(() => {
  //         localMediaStream.getTracks().forEach((track: any) => {
  //           track.stop();
  //         });

  //         video.srcObject = null;
  //       }, 2000);
  //     });
  // }, []);

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

      <video height="400" width="430" autoPlay muted />

      <div className="flex flex-row items-center bg-zinc-800 h-20 px-5">
        <Logo type={LogoType.small} className="scale-[0.4]" />
        <input
          ref={inputRef}
          placeholder="type / to search"
          className="placeholder:text-zinc-400 bg-transparent outline-none text-zinc-100 mr-auto flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Button
          onClick={() => updateStatus(UserStatus.FLOW_STATE)}
          color="secondary"
          size="small"
          style={{ textTransform: "none" }}
        >
          flow state
        </Button>

        <span className="px-5" onClick={handleClick}>
          {userDetailsResponse?.user && (
            <UserAvatarWithStatus user={userDetailsResponse?.user} />
          )}
        </span>
      </div>
      <Menu
        anchorEl={anchorEl as Element}
        id="profile-menu"
        open={openAvatarMenu}
        onClose={handleClose}
        onClick={handleClose}
      >
        <MenuItem onClick={() => updateStatus(UserStatus.ONLINE)}>
          <ListItemIcon>
            {userDetailsResponse?.user.status === UserStatus.ONLINE && (
              <Check fontSize="small" />
            )}
          </ListItemIcon>
          Online
        </MenuItem>
        <MenuItem onClick={() => updateStatus(UserStatus.OFFLINE)}>
          <ListItemIcon>
            {userDetailsResponse?.user.status === UserStatus.OFFLINE && (
              <Check fontSize="small" />
            )}
          </ListItemIcon>
          Away
        </MenuItem>
        <MenuItem onClick={() => updateStatus(UserStatus.FLOW_STATE)}>
          <ListItemIcon>
            {userDetailsResponse?.user.status === UserStatus.OFFLINE && (
              <Check fontSize="small" />
            )}
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
