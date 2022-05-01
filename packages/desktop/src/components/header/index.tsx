import {
  Avatar,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
} from "@mui/material";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import { HeadsetMicSharp, VideocamSharp } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { $selectedOutputMode } from "../../controller/recoil";
import { FaSearch } from "react-icons/fa";
import Logo from "../Logo";
import { useGetUserDetails } from "../../controller/index";
import { useRecoilState } from "recoil";

export default function NirvanaHeader({
  onHeaderFocus,
}: {
  onHeaderFocus: () => void;
}) {
  const { data: userDetailsRes, isLoading } = useGetUserDetails();

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [outputMode, setOutputMode] = useRecoilState($selectedOutputMode);

  const [userVideoStream, setUserVideoStream] =
    useState<MediaStream>(undefined);

  // todo: show user local video stream
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        setUserVideoStream(stream);
      });
  }, []);

  useEffect(() => {
    const videoElem = document.querySelector("video");
    if (userVideoStream && outputMode === "video" && videoElem)
      videoElem.srcObject = userVideoStream;
  }, [userVideoStream, outputMode]);

  const menuOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const selectSearch = () => {
    inputRef.current?.focus();
  };

  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const keyMap: KeyMap = {
    SELECT_SEARCH: {
      name: "select search to start searching",
      sequence: "/",
      action: "keyup",
    },
  };
  const handlers = {
    SELECT_SEARCH: selectSearch,
  };

  if (isLoading) return <>loading</>;

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} />

      <div
        className="flex flex-row items-center bg-gray-100 pl-2 border-b border-b-gray-200"
        id="titlebar"
        onFocus={onHeaderFocus}
      >
        <Logo type="small" />

        <div className="mx-auto flex flex-row items-center space-x-2 ml-2">
          <FaSearch className="text-xs text-gray-300" />
          <input
            placeholder="Type / to search"
            className="bg-transparent placeholder-gray-300 placeholder:text-xs focus:outline-none"
            ref={inputRef}
            onChange={onSearchChange}
            value={searchInput}
          />
        </div>

        {/* todo: move this ghost button to components */}
        <button className="text-gray-300 text-xs px-2 py-1 transition-all hover:bg-gray-200">
          flow state
        </button>

        <div onClick={handleOpenMenu} className={"cursor-pointer ml-2"}>
          {outputMode === "video" && (
            <video height={"50px"} width={"50px"} muted autoPlay />
          )}

          {userDetailsRes?.user?.picture && outputMode === "audio" && (
            <Avatar
              className="mr-1"
              alt={userDetailsRes?.user?.givenName}
              src={userDetailsRes?.user?.picture}
              variant="square"
            />
          )}
        </div>

        {/* menu for the output options */}
        <Menu
          open={menuOpen}
          id="user-output-selection-menu"
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={() => setOutputMode("audio")}>
            <ListItemIcon>
              <HeadsetMicSharp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Audio Only</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => setOutputMode("video")}>
            <ListItemIcon>
              <VideocamSharp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Video</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </>
  );
}
