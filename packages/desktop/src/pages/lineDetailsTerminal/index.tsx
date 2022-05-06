import { FiActivity, FiSettings, FiSun } from "react-icons/fi";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import { useCallback, useMemo } from "react";

import { $selectedLineId } from "../../controller/recoil";
import { ILineDetails } from "../router";
import LineIcon from "../../components/lines/lineIcon/index";
import { useRecoilState } from "recoil";

export default function LineDetailsTerminal() {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);

  const handleEscape = useCallback(() => {
    console.log("deselecting line");

    setSelectedLineId(null);
  }, [setSelectedLineId]);

  const keyMap: KeyMap = useMemo(
    () => ({
      DESELECT_LINE: "esc",
    }),
    [handleEscape]
  );

  const handlers = useMemo(
    () => ({
      DESELECT_LINE: handleEscape,
    }),
    [handleEscape]
  );

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />

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
          <button className="p-3 flex justify-center items-center hover:bg-gray-300 transition-all">
            <FiSettings className="text-gray-400 text-md" />
          </button>

          <button className="bg-gray-800 p-3 flex justify-center items-center shadow-lg">
            <FiActivity className="text-white text-lg" />
          </button>

          {/* TODO: change to border and inset color for when inactive button */}
          <button className="bg-teal-800 p-3 flex justify-center items-center shadow-lg">
            <FiSun className="text-white text-lg" />
          </button>
        </div>
      </div>
    </>
  );
}
