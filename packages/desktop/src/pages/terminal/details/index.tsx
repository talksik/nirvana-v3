import { FiActivity, FiSettings, FiSun } from "react-icons/fi";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import { useCallback, useMemo } from "react";

import { $selectedLineId } from "../../../controller/recoil";
import { ILineDetails } from "../../router";
import LineIcon from "../../../components/lines/lineIcon/index";
import { LineMemberState } from "@nirvana/core/models/line.model";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { Tooltip } from "antd";
import { useLineDataProvider } from "../../../controller/lineDataProvider";
import { useRecoilState } from "recoil";

export default function LineDetailsTerminal() {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);

  const { linesMap } = useLineDataProvider();

  const selectedLine: MasterLineData | undefined = useMemo(() => {
    if (!selectedLineId) return undefined;

    // find the line from the data provider
    if (linesMap[selectedLineId]) {
      return linesMap[selectedLineId];
    }

    return undefined;
  }, [selectedLineId, linesMap]);

  const isUserToggleTuned = useMemo(
    () => selectedLine?.currentUserMember?.state === LineMemberState.TUNED,
    [selectedLine]
  );

  return (
    <>
      <div className="flex flex-col bg-gray-100 w-[400px] items-stretch justify-start relative">
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
          <button
            className={`p-3 flex justify-center items-center hover:bg-gray-300
           transition-all hover:scale-105`}
          >
            <FiSettings className="text-gray-400 text-md" />
          </button>

          <Tooltip
            title={`${
              isUserToggleTuned ? "toggle tuned" : "temporarily tuned"
            }`}
          >
            <button
              className={`p-3 flex justify-center items-center shadow-lg
          hover:scale-105 transition-all animate-pulse ${
            isUserToggleTuned ? "bg-gray-800 text-white" : "text-black"
          }`}
            >
              <FiActivity className="text-lg" />
            </button>
          </Tooltip>

          {/* TODO: change to border and inset color for when inactive button */}
          <button
            className={`p-3 flex justify-center items-center shadow-lg
          hover:scale-105 transition-all ${
            selectedLine.isUserBroadcasting || selectedLine.isOtherBroadcasting
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
