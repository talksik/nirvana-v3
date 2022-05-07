import { FiActivity, FiSettings, FiSun } from "react-icons/fi";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import { useCallback, useEffect, useMemo } from "react";

import { $selectedLineId } from "../../../controller/recoil";
import LineIcon from "../../../components/lines/lineIcon/index";
import { LineMemberState } from "@nirvana/core/models/line.model";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { Tooltip } from "antd";
import { useGetUserDetails } from "../../../controller/index";
import { useLineDataProvider } from "../../../controller/lineDataProvider";
import { useRecoilState } from "recoil";

export default function LineDetailsTerminal({
  selectedLine,
}: {
  selectedLine: MasterLineData;
}) {
  const { handleTuneToLine } = useLineDataProvider();
  const { data: userDetails } = useGetUserDetails();

  const isUserToggleTuned = useMemo(
    () => selectedLine?.currentUserMember?.state === LineMemberState.TUNED,
    [selectedLine]
  );

  // seeing if I am in the list of broadcasters
  // the source of truth from the socket connections telling me if my clicking actually made a round trip
  const isUserBroadcasting = useMemo(
    () =>
      selectedLine?.currentBroadcastersUserIds?.includes(
        userDetails?.user._id.toString()
      ),
    [userDetails, selectedLine]
  );

  return (
    <>
      <div className="flex flex-col flex-1 bg-gray-100 items-stretch justify-start relative border-l border-l-gray-100">
        {/* line overview header */}
        <div className="flex flex-row p-3 items-center gap-1">
          {/* <LineIcon sourceImages={selectedLine.profilePictures} />

          <span className="flex flex-col items-start gap-1">
            <h2
              className={`text-inherit text-md truncate ${
                selectedLine.hasNewActivity ? "font-semibold" : ""
              }`}
            >
              {selectedLine.name}
            </h2>

            <span className="text-xs text-gray-300">
              {`${selectedLine.numberMembers} members`}
            </span>
          </span> */}
        </div>

        {/* controls */}
        <div
          className="absolute bottom-0 p-4 shadow-2xl
        flex flex-row items-center gap-2 justify-end w-full"
        >
          <span className="mr-auto text-teal-800">{`${
            selectedLine?.tunedInMemberIds?.length ?? 0
          } on the line`}</span>

          <button
            className={`p-3 flex justify-center items-center hover:bg-gray-300
           transition-all hover:scale-105`}
          >
            <FiSettings className="text-gray-400 text-md" />
          </button>

          {/* TODO: move to on hover of line row  */}
          <Tooltip
            title={`${
              isUserToggleTuned ? "click to untoggle" : "click to stay tuned in"
            }`}
          >
            <button
              className={`p-3 flex justify-center items-center shadow-lg
          hover:scale-105 transition-all animate-pulse ${
            isUserToggleTuned ? "bg-gray-800 text-white" : "text-black"
          }`}
              onClick={() =>
                handleTuneToLine(selectedLine.lineDetails._id.toString(), true)
              }
            >
              <FiActivity className="text-lg" />
            </button>
          </Tooltip>

          <button
            className={`p-3 flex justify-center items-center shadow-lg
          hover:scale-105 transition-all ${
            isUserBroadcasting
              ? "bg-teal-800 text-white"
              : "text-teal-800 border-teal-800 border"
          }`}
          >
            <FiSun className="text-lg" />
          </button>
        </div>
      </div>
    </>
  );
}
