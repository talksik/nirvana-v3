import { FiActivity, FiSun } from "react-icons/fi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { $selectedLineId } from "../../../controller/recoil";
import { Avatar } from "antd";
import LineIcon from "../lineIcon";
import { LineMemberState } from "@nirvana/core/models/line.model";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import Peer from "simple-peer";
import moment from "moment";
import toast from "react-hot-toast";
import { useGetUserDetails } from "../../../controller/index";
import { useLineDataProvider } from "../../../controller/lineDataProvider";
import { useRecoilState } from "recoil";

// todo: send a much more comprehensive master line object? or just add properties to the
// masterLineData object so that we don't have different models to maintain between client and server

export default function LineRow({
  masterLineData,
  handleSelectLine,
}: {
  masterLineData: MasterLineData;
  handleSelectLine: (lineId: string) => void;
}) {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const { data: userData } = useGetUserDetails();

  // take the source of truth list of memeberIds tuned in, and see if I'm in it
  const isUserTunedIn = useMemo(
    () =>
      masterLineData.tunedInMemberIds?.includes(userData?.user?._id.toString()),
    [masterLineData.tunedInMemberIds, userData]
  );

  /**
   * TODO: slowly add to this and fix based on added features
   * */
  const renderActivityIcon = useMemo(() => {
    if (isUserTunedIn) return <FiActivity className="text-black" />;

    // if there is someone or me broadcasting here
    if (masterLineData.currentBroadcastersUserIds?.length > 0)
      return <FiSun className="text-xs text-teal-500" />;

    // if there is new activity blocks for me
    if (masterLineData.currentUserMember.lastVisitDate)
      return (
        <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>
      );

    return (
      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
    );
  }, [masterLineData, isUserTunedIn]);

  const renderRightActivity = useMemo(() => {
    // TODO: get the profile pictures of the broadcasters
    if (masterLineData.currentBroadcastersUserIds?.length > 0)
      return (
        <Avatar.Group
          key={`lineRowRightActivityGroup-${masterLineData.lineDetails._id.toString()}`}
          maxCount={2}
          maxPopoverTrigger="click"
          size="small"
          maxStyle={{
            color: "#f56a00",
            backgroundColor: "#fde3cf",
            cursor: "pointer",
            borderRadius: "0",
          }}
          className="shadow-lg"
        >
          {masterLineData.otherUserObjects?.map((otherUser, index) => (
            <Avatar
              key={`lineListActivitySection-${otherUser._id.toString()}-${index}`}
              src={otherUser.picture ?? ""}
              shape="square"
              size={"small"}
            />
          ))}
        </Avatar.Group>
      );

    // if there is new activity/black dot, then show relative time as little bolder? or too much?

    // TODO: compare last visit date to latest audio block
    if (masterLineData.currentUserMember.lastVisitDate)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {moment(masterLineData.currentUserMember.lastVisitDate).fromNow()}
        </span>
      );

    return (
      <span className={`text-gray-300 ml-auto text-xs `}>
        {moment(masterLineData.currentUserMember.lastVisitDate).fromNow()}
      </span>
    );
  }, [masterLineData]);

  const profilePictures = useMemo(() => {
    const pictureSources: string[] = [];

    // ?don't add in my image as that's useless contextually?
    // if (userData?.user?.picture) pictureSources.push(userData.user.picture);

    masterLineData.otherUserObjects?.forEach((otherUser) => {
      if (otherUser.picture) pictureSources.push(otherUser.picture);
    });

    return pictureSources;
  }, [masterLineData, userData]);

  return (
    <>
      <div
        onClick={() =>
          handleSelectLine(masterLineData.lineDetails._id.toString())
        }
        className={`flex flex-row items-center justify-start gap-2 p-2 px-4 h-14 hover:bg-gray-200 cursor-pointer transition-all
  last:border-b-0 border-b border-b-gray-200 relative z-50 ${
    selectedLineId === masterLineData.lineDetails._id.toString() &&
    "bg-gray-200 scale-110 shadow-2xl translate-x-3"
  }`}
      >
        {/* status dot */}
        {renderActivityIcon}

        <span className="flex flex-row gap-2 items-center justify-start text-slate-800">
          {profilePictures && (
            <LineIcon
              grayscale={!isUserTunedIn}
              sourceImages={profilePictures}
            />
          )}

          <h2
            className={`text-inherit text-md truncate ${
              masterLineData.currentUserMember.lastVisitDate
                ? "font-semibold"
                : ""
            }`}
          >
            {masterLineData.lineDetails.name ||
              masterLineData.otherUserObjects[0].givenName}
          </h2>
        </span>

        <div className="ml-auto">{renderRightActivity}</div>
      </div>

      {/* mounts and unmounts based on if in the room or now */}
      {isUserTunedIn && (
        <StreamRoom
          currentBroadcasters={masterLineData.currentBroadcastersUserIds}
          initialTunedInUserIds={masterLineData.tunedInMemberIds}
        />
      )}
    </>
  );
}

function StreamRoom({
  initialTunedInUserIds,
  currentBroadcasters,
}: {
  initialTunedInUserIds?: string[];
  currentBroadcasters?: string[];
}) {
  // ?could move this up the tree and pass it down? or set it in the header?
  // local stream specifically for this stream room
  const [localStream, setLocalStream] = useState<MediaStream>();
  const userStreamTagRef = useRef<HTMLVideoElement>(null);

  // local peer map of userIds to peers
  const [userPeers, setUserPeers] = useState<{ [userId: string]: Peer }>({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((userStream) => {
        setLocalStream(userStream);

        if (userStreamTagRef?.current)
          userStreamTagRef.current.srcObject = userStream;

        // const audio = new Audio();
        // audio.autoplay = true;
        // audio.srcObject = userStream;
      })
      .catch((error) => {
        console.error(error);

        toast.error(
          "Make sure that you have permissions enabled and microphone connected"
        );
      });
  }, []);

  // we only loop through peers that are associated to user Ids which exist in the currentBroadcasters array
  return (
    <>
      <audio autoPlay ref={userStreamTagRef} muted />
      this is the video of people
      {Object.entries(userPeers).map(([userId, peer]) => (
        <PeerStreamRenderer
          key={userId}
          isBroadcasting={currentBroadcasters?.includes(userId)}
          peer={peer}
        />
      ))}
    </>
  );
}

/**
 * take in the specified peer and whether or not he is broadcasting
 */
function PeerStreamRenderer({
  peer,
  isBroadcasting,
}: {
  peer: Peer;
  isBroadcasting: boolean;
}) {
  const streamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (remotePeerStream: MediaStream) => {
      console.log(
        "stream coming in from remote peer...BUT, only going to show once they broadcast"
      );

      if (streamRef?.current) streamRef.current.srcObject = remotePeerStream;
    });
  }, [streamRef]);

  // when someone is broadcasting, we enable their stream

  return (
    <>
      <video
        muted={!isBroadcasting}
        autoPlay
        ref={streamRef}
        height={"400"}
        width={"500"}
      />
    </>
  );
}
