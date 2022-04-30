import { $jwtToken, $searchQuery } from "../../../controller/recoil";
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
      </div>
    </>
  );
}
