import { Button, Drawer } from "@mui/material";
import { Header, HeaderName } from "carbon-components-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "antd";
import Logo from "../Logo";
import { useGetUserDetails } from "../../controller/index";

export default function NirvanaHeader() {
  const { data: userDetailsRes, isLoading } = useGetUserDetails();

  const userVideo = useRef<HTMLVideoElement>();
  const [userVideoStream, setUserVideoStream] =
    useState<MediaStream>(undefined);

  // todo: show user local video stream
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        if (userVideo?.current) userVideo.current.srcObject = stream;
        setUserVideoStream(stream);
      });
  }, []);

  if (isLoading) return <>loading</>;

  return (
    <div className="flex flex-row items-center h-12 bg-gray-100">
      <Logo type="small" className="scale-[0.2]" />

      <UserOutputSelectionDrawer />

      <div className="ml-auto">
        <Button color="info" size="small">
          flow state
        </Button>
      </div>

      <video
        className="ml-2"
        ref={userVideo}
        height={"50px"}
        width={"50px"}
        muted
        autoPlay
      />

      {!userVideoStream && userDetailsRes?.user?.picture && (
        <Avatar src={userDetailsRes?.user?.picture} />
      )}
    </div>
  );
}

/**
 *
 * select between video, audio, and just profile picture
 */
function UserOutputSelectionDrawer() {
  const [open, setOpen] = useState<boolean>(false);

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    setOpen((isCurrentlyOpen) => !isCurrentlyOpen);
  };

  return (
    <>
      <Button onClick={toggleDrawer}>open drawer</Button>
      <Drawer anchor={"top"} open={open} onClose={toggleDrawer}>
        Option one
      </Drawer>
    </>
  );
}
