import { $desktopMode, $selectedLineId } from "../../controller/recoil";
import { GlobalHotKeys, KeyMap } from "react-hotkeys";
import { Skeleton, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetUserDetails, useUserLines } from "../../controller/index";
import { useRecoilState, useSetRecoilState } from "recoil";

import { FaPlus } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import IconButton from "../../components/Button/IconButton/index";
import LineDetailsTerminal from "./details";
import { LineMemberState } from "@nirvana/core/models/line.model";
import LineRow from "../../components/lines/lineRow.tsx/index";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import NewLineModal from "./newLine";
import toast from "react-hot-toast";
import { useLineDataProvider } from "../../controller/lineDataProvider";

export default function NirvanaTerminal({
  overlayOnly,
}: {
  overlayOnly: boolean;
}) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { data: userDetails } = useGetUserDetails();
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const [desktopMode, setDesktopMode] = useRecoilState($desktopMode);

  // simply using this query for specific data on loading
  // todo: add these properties in context provider value although more work down the line for control
  const { isLoading: isLoadingInitialLines } = useUserLines();
  const { linesMap, handleTuneToLine, handleUnTuneToLine } =
    useLineDataProvider();

  useEffect(() => {
    // console.log("change/update in lines map");
    // console.log(linesMap);
  }, [linesMap]);

  // ! remounting when toggle tuning and untoggle tuning a line
  // because it changes the list that it's in...solution 1: put everything in one list and use one sort to handle toggle tuned items to be clean
  // the change in the object or the property which is specifically currentUserMember of the masterLineData sent in to line row
  // causes a re-render but not a unmount and remount

  const allLines: MasterLineData[] = useMemo(() => {
    const masterLines: MasterLineData[] = Object.values(linesMap);

    // TODO: sort based on the audio blocks and currentMember lastActiveDate

    return masterLines.filter(
      (masterLine) =>
        masterLine.currentUserMember.state === LineMemberState.INBOX
    );
  }, [linesMap]);

  const toggleTunedLines = useMemo(() => {
    const masterLines: MasterLineData[] = Object.values(linesMap);

    return masterLines.filter(
      (masterLine) =>
        masterLine.currentUserMember.state === LineMemberState.TUNED
    );
  }, [linesMap]);

  const selectedLine: MasterLineData | undefined = useMemo(() => {
    if (!selectedLineId) return undefined;

    // find the line from the data provider
    if (linesMap[selectedLineId]) {
      // console.log("looking for selected Line in map for details section");

      const foundSelectedLine = linesMap[selectedLineId];

      // on mount of this, we want to temporarily tune into the line if we are not already tuned in...which would happen if we toggle tuned in
      if (
        !foundSelectedLine.tunedInMemberIds?.includes(
          userDetails?.user?._id.toString()
        )
      ) {
        handleTuneToLine(selectedLineId, false);
      }

      return { ...foundSelectedLine };
    }

    return undefined;
  }, [selectedLineId, linesMap, userDetails]);

  // todo: sort/order based on activity and activity date and currently broadcasting/live

  const handleEscape = useCallback(() => {
    console.log("deselecting line");

    setSelectedLineId((prevSelectedLineId) => {
      // ! only want to untune if it's a temporarily tuned line
      if (selectedLine.currentUserMember?.state === LineMemberState.INBOX)
        handleUnTuneToLine(prevSelectedLineId);

      return null;
    });
  }, [setSelectedLineId, selectedLine]);

  /** show user line details on click of one line */
  const handleSelectLine = useCallback(
    (newLineIdToSelect: string) => {
      if (newLineIdToSelect !== selectedLine?.lineDetails._id.toString()) {
        setSelectedLineId((prevSelectedLineId) => {
          // untune myself from the previously selected if it was a temporary one/inbox
          // todo: p3: consolidate this logic as it's used in escape but different scenarios sort of so p3
          if (
            prevSelectedLineId &&
            selectedLine.currentUserMember?.state === LineMemberState.INBOX
          )
            handleUnTuneToLine(prevSelectedLineId);

          return newLineIdToSelect;
        });
      }
    },
    [setSelectedLineId, selectedLine]
  );

  const handleToggleTuneToLine = useCallback(
    (lineId: string, turnToggleOn: boolean) => {
      // inhibit if they are trying to turn on and already have 3 toggle tuned
      if (toggleTunedLines?.length >= 3 && turnToggleOn) {
        toast.error("You cannot toggle more than 3 lines!");

        return;
      }

      handleTuneToLine(lineId, turnToggleOn);
    },
    [toggleTunedLines, handleTuneToLine]
  );

  const handleStartBroadcast = useCallback(
    (lineId: string) => () => {
      console.log(`starting broadcast for ${lineId}!!!`);

      // todo: enable stream in this tuned in channel

      // if (lineId) handleUserBroadcast(lineId, true);
    },
    []
  );

  const handleStopBroadcast = useCallback(
    (lineId: string) => () => {
      console.log(`stopping broadcast for ${lineId}!!!`);

      // todo: disable stream in this tuned in channel

      // if (lineId) handleUserBroadcast(lineId, false);
    },
    []
  );

  const keyMap: KeyMap = useMemo(
    () => ({
      DESELECT_LINE: "esc",
      START_BROADCAST: {
        sequence: "`",
        action: "keydown",
      },
      STOP_BROADCAST: {
        sequence: "`",
        action: "keyup",
      },
    }),
    []
  );

  const handlers = useMemo(
    () => ({
      DESELECT_LINE: handleEscape,
      START_BROADCAST: handleStartBroadcast(selectedLineId),
      STOP_BROADCAST: handleStopBroadcast(selectedLineId),
    }),
    [selectedLineId]
  );

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />

      <div className="flex flex-row flex-1">
        <div className="flex flex-col bg-white w-[400px] relative group">
          {/* modal for creating new line */}
          <NewLineModal
            open={isModalVisible}
            handleClose={() => setIsModalVisible(false)}
          />

          {/* tuned in lines block */}
          <div className="bg-gray-100 flex flex-col shadow-lg">
            {/* tuned in header + general controls */}
            <div className="flex flex-row items-center py-3 px-4 pb-0">
              <span className="flex flex-row gap-2 items-center justify-start text-gray-400 animate-pulse">
                <FiActivity className="text-sm" />

                <h2 className="text-inherit text-sm">Tuned In</h2>

                <p className="text-slate-300 text-xs">{`${
                  toggleTunedLines?.length || 0
                }/3`}</p>
              </span>
            </div>

            {/* list of toggle tuned lines */}
            <div className="flex flex-col mt-2">
              {toggleTunedLines.map((masterLineData) => (
                <LineRow
                  key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
                  masterLineData={masterLineData}
                  handleSelectLine={handleSelectLine}
                />
              ))}
            </div>
          </div>

          {!(allLines.length > 0) && !(toggleTunedLines.length > 0) && (
            <span className="text-gray-300 text-sm my-5 text-center">
              You have no lines! <br /> Create one to connect to your team
              instantly.
            </span>
          )}

          {/* rest of the lines */}
          <div className={"flex flex-col"}>
            {isLoadingInitialLines ? (
              <Skeleton />
            ) : (
              allLines.map((masterLineData) => (
                <LineRow
                  key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
                  masterLineData={masterLineData}
                  handleSelectLine={handleSelectLine}
                />
              ))
            )}
          </div>

          <div
            onClick={() => setIsModalVisible(true)}
            className="absolute bottom-3 right-3 z-10 scale-0 
            group-hover:scale-100 ease-in-out hover:transition group-hover:transition delay-100 duration-200"
          >
            <button
              className="flex flex-row gap-2 items-center justify-evenly 
              shadow-xl bg-gray-800 p-2 text-white text-xs"
            >
              <FaPlus />
              <span>New line</span>
            </button>
          </div>
        </div>

        <LineDetailsTerminal
          handleToggleTuneToLine={handleToggleTuneToLine}
          selectedLine={selectedLine}
        />
      </div>
    </>
  );
}
