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
    </>
    // <div
    //   id={`${selectedLine.lineId}-lineDetailsTerminal`}
    //   className="flex flex-col bg-gray-100 w-[400px]"
    // >
    //   {/* line overview header */}
    //   <div className="flex flex-row p-3 items-center gap-1">
    //     <LineIcon sourceImages={selectedLine.profilePictures} />

    //     <span className="flex flex-col items-start gap-1">
    //       <h2
    //         className={`text-inherit text-md truncate ${
    //           selectedLine.hasNewActivity ? "font-semibold" : ""
    //         }`}
    //       >
    //         {selectedLine.name}
    //       </h2>

    //       <span className="text-xs text-gray-300">
    //         {`${selectedLine.numberMembers} members`}
    //       </span>
    //     </span>
    //   </div>
    // </div>
  );
}
