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
import { useLineDataProvider } from "../../controller/lineDataProvider";

export default function NirvanaTerminal() {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { data: userDetails } = useGetUserDetails();
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const [desktopMode, setDesktopMode] = useRecoilState($desktopMode);

  // simply using this query for specific data on loading
  // todo: add these properties in context provider value although more work down the line for control
  const { isLoading: isLoadingInitialLines } = useUserLines();
  const { linesMap, handleTuneToLine } = useLineDataProvider();

  useEffect(() => {
    console.log("change/update in lines map");

    // console.log(linesMap);
  }, [linesMap]);

  const allLines: MasterLineData[] = useMemo(() => {
    const masterLines: MasterLineData[] = Object.values(linesMap);

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

  // todo: sort/order based on activity and activity date and currently broadcasting/live

  const handleEscape = useCallback(() => {
    console.log("deselecting line");

    setSelectedLineId(null);
  }, [setSelectedLineId]);

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

  const selectedLine: MasterLineData | undefined = useMemo(() => {
    if (!selectedLineId) return undefined;

    // find the line from the data provider
    if (linesMap[selectedLineId]) {
      console.log("looking for selected Line in map for details section");

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

  const [listRenderTest, setListRenderTest] = useState<boolean>(false);
  useEffect(() => {
    setInterval(() => {
      setListRenderTest(true);
    }, 2000);
  }, [setListRenderTest]);

  return (
    <>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges />

      <div className="flex flex-row flex-1">
        <div className="flex flex-col bg-white w-[400px]">
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

                <p className="text-slate-300 text-xs">0/5</p>
              </span>

              <Tooltip title="new line">
                <div
                  onClick={() => setIsModalVisible(true)}
                  className="ml-auto shadow-xl"
                >
                  <IconButton>
                    <FaPlus />
                  </IconButton>
                </div>
              </Tooltip>
            </div>

            {/* list of toggle tuned lines */}
            <div className="flex flex-col mt-2">
              {toggleTunedLines.map((masterLineData) => (
                <LineRow
                  key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
                  masterLineData={masterLineData}
                />
              ))}
            </div>
          </div>

          {!(allLines.length > 0 && !(toggleTunedLines.length > 0)) && (
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
                />
              ))
            )}
          </div>
        </div>

        {desktopMode === "terminalDetails" && selectedLine && (
          <LineDetailsTerminal selectedLine={selectedLine} />
        )}

        {listRenderTest && <RenderTest />}
      </div>
    </>
  );
}

function RenderTest() {
  useEffect(() => {
    console.error("YOOOO FROM THE RENDER TEST COMPONENT");
  }, []);

  return <>this is the render test</>;
}
