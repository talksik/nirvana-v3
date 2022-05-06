import { useCallback, useMemo } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { $selectedLineId } from "../../../controller/recoil";
import { Avatar } from "antd";
import { FiSun } from "react-icons/fi";
import LineIcon from "../lineIcon";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { useGetUserDetails } from "../../../controller/index";

// todo: send a much more comprehensive master line object? or just add properties to the
// masterLineData object so that we don't have different models to maintain between client and server

export default function LineRow({
  masterLineData,
}: {
  masterLineData: MasterLineData;
}) {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const { data: userData } = useGetUserDetails();

  /** show user line details */
  const handleSelectLine = useCallback(() => {
    setSelectedLineId(masterLineData.lineDetails._id.toString());
  }, [setSelectedLineId, masterLineData]);

  /**
   * TODO: slowly add to this and fix based on added features
   * */
  const renderActivityIcon = useMemo(() => {
    // if there is someone or me broadcasting here
    // if (masterLineData.currentUserMember.lastVisitDate)
    return <FiSun className="text-xs text-teal-500" />;

    // if there is new activity blocks for me
    if (masterLineData.currentUserMember.lastVisitDate)
      return (
        <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>
      );

    return (
      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
    );
  }, [masterLineData]);

  const renderRightActivity = useMemo(() => {
    // TODO: this should be the list of broadcasters, not members...change once we have that
    if (masterLineData.otherUserObjects?.length)
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

    // TODO: add moment for relative time of activity
    if (masterLineData.currentUserMember.lastVisitDate)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {masterLineData.currentUserMember.lastVisitDate}
        </span>
      );

    return (
      <span className={`text-gray-300 ml-auto text-xs `}>
        {masterLineData.currentUserMember.lastVisitDate}
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
    <div
      onClick={handleSelectLine}
      className={`flex flex-row items-center justify-start gap-2 p-2 px-4 h-14 hover:bg-gray-200 cursor-pointer transition-all
  last:border-b-0 border-b border-b-gray-200 relative z-50 ${
    selectedLineId === masterLineData.lineDetails._id.toString() &&
    "bg-gray-200 scale-110 shadow-2xl translate-x-3"
  }`}
    >
      {/* status dot */}
      {renderActivityIcon}

      <span className="flex flex-row gap-2 items-center justify-start text-slate-800">
        {profilePictures && <LineIcon sourceImages={profilePictures} />}

        <h2
          className={`text-inherit text-md truncate ${
            masterLineData.currentUserMember.lastVisitDate
              ? "font-semibold"
              : ""
          }`}
        >
          {masterLineData.lineDetails.name}
        </h2>
      </span>

      <div className="ml-auto">{renderRightActivity}</div>
    </div>
  );
}
