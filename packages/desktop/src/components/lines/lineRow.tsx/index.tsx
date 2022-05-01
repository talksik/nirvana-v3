import { useCallback, useMemo } from "react";

import { Avatar } from "antd";
import { FiSun } from "react-icons/fi";
import { ILineDetails } from "../../../pages/router/index";
import LineIcon from "../lineIcon";

export default function LineRow({
  lineDetails,
  onClick,
}: {
  lineDetails: ILineDetails;
  onClick: (lineId: string) => void;
}) {
  const renderActivityIcon = useMemo(() => {
    if (lineDetails.isUserBroadcastingHere)
      return <FiSun className="text-xs text-teal-500" />;

    if (
      lineDetails.isSomeoneElseBroadcastingHere ||
      lineDetails.profilePicsLiveBroadcasters?.length > 0
    )
      return <FiSun className="text-xs text-gray-800" />;

    if (lineDetails.hasNewActivity)
      return (
        <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>
      );

    if (lineDetails.isUserToggleTunedIn)
      return (
        <span className="h-2 w-2 rounded-full bg-slate-200 animate-pulse"></span>
      );

    return (
      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
    );
  }, [lineDetails]);

  const renderRightActivity = useMemo(() => {
    if (lineDetails.profilePicsLiveBroadcasters?.length)
      return (
        <Avatar.Group
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
          {lineDetails.profilePicsLiveBroadcasters.map((avatarSrc) => (
            <Avatar src={avatarSrc} shape="square" size={"small"} />
          ))}
        </Avatar.Group>
      );

    if (lineDetails.hasNewActivity)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {lineDetails.timeAgo}
        </span>
      );

    return (
      <span className={`text-gray-300 ml-auto text-xs `}>
        {lineDetails.timeAgo}
      </span>
    );
  }, [lineDetails]);

  const handleSelectLine = useCallback(
    (e) => onClick(lineDetails.lineId),
    [onClick, lineDetails]
  );

  return (
    <div
      onClick={handleSelectLine}
      id={lineDetails.lineId}
      className="flex flex-row items-center justify-start gap-2 p-2 px-4 h-14 hover:bg-gray-200 cursor-pointer transition-all
  last:border-b-0 border-b border-b-gray-200"
    >
      {/* status dot */}
      {renderActivityIcon}

      <span className="flex flex-row gap-2 items-center justify-start text-slate-800">
        {lineDetails.profilePictures && (
          <LineIcon sourceImages={lineDetails.profilePictures} />
        )}

        <h2
          className={`text-inherit text-md truncate ${
            lineDetails.hasNewActivity ? "font-semibold" : ""
          }`}
        >
          {lineDetails.name}
        </h2>
      </span>

      <div className="ml-auto">{renderRightActivity}</div>
    </div>
  );
}
