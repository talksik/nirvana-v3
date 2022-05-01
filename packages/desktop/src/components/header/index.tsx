import {
  Avatar,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
} from "@mui/material";
import { HeadsetMicSharp, VideocamSharp } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { $selectedOutputMode } from "../../controller/recoil";
import Logo from "../Logo";
import { useGetUserDetails } from "../../controller/index";
import { useRecoilState } from "recoil";

export default function NirvanaHeader() {
  const { data: userDetailsRes, isLoading } = useGetUserDetails();

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
    if (userVideoStream && outputMode === "video")
      document.querySelector("video").srcObject = userVideoStream;
  }, [userVideoStream, outputMode]);

  const menuOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  if (isLoading) return <>loading</>;

  return (
    <div className="flex flex-row items-center h-12 bg-gray-100">
      <Logo type="small" className="scale-[0.2]" />

      <div className="ml-auto">
        <Button color="info" size="small">
          flow state
        </Button>
      </div>

      <div onClick={handleOpenMenu}>
        {outputMode === "video" && (
          <video
            className="ml-2"
            height={"50px"}
            width={"50px"}
            muted
            autoPlay
          />
        )}

        {userDetailsRes?.user?.picture && outputMode === "audio" && (
          <Avatar
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
  );
}
