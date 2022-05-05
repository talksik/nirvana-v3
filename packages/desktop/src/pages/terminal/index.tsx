import { $desktopMode, $selectedLineId } from "../../controller/recoil";
import { Skeleton, Tooltip } from "antd";
import { useCallback, useMemo, useState } from "react";

import { FaPlus } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import { ILineDetails } from "../router";
import IconButton from "../../components/Button/IconButton/index";
import LineRow from "../../components/lines/lineRow.tsx/index";
import NewLineModal from "./newLine";
import { useSetRecoilState } from "recoil";
import { useUserLines } from "../../controller/index";

export default function NirvanaTerminal({
  allLines,
}: {
  allLines: ILineDetails[];
}) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);

  const setSelectedLineId = useSetRecoilState($selectedLineId);
  const setDesktopMode = useSetRecoilState($desktopMode);

  const { data: userLinesRes, isLoading } = useUserLines();

  // todo: sort/order based on activity and activity date and currently broadcasting/live

  const toggleTunedLines = useMemo(
    () => allLines.filter((line) => line.isUserToggleTunedIn),
    []
  );

  const restLines = useMemo(
    () => allLines.filter((line) => !line.isUserToggleTunedIn),
    []
  );

  return (
    <div className="flex flex-col bg-white w-[400px]">
      {/* modal for creating new line */}
      <NewLineModal
        open={isModalVisible}
        handleClose={() => setIsModalVisible(false)}
      />

      {/* tuned in lines block */}
      <div className="bg-gray-100 flex flex-col shadow-lg">
        {/* tuned in header + general controls */}
        <div className="flex flex-row items-center p-3 pb-0">
          <span className="flex flex-row gap-2 items-center justify-start text-slate-800">
            <FiActivity className="text-sm" />

            <h2 className="text-inherit font-semibold text-sm">Tuned In</h2>

            <p className="text-slate-300 text-xs">3/5</p>
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
          {/* {toggleTunedLines.map((line) => (
            <LineRow
              key={line.lineId}
              lineDetails={line}
              onClick={handleSelectLine}
            />
          ))} */}
        </div>
      </div>

      {/* rest of the lines */}
      <div className={"flex flex-col"}>
        {/* {restLines.map((line) => (
     <LineRow
       key={line.lineId}
       lineDetails={line}
       onClick={handleSelectLine}
     />
   ))} */}
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {userLinesRes?.data?.masterLines?.map((masterLineData) => (
              <LineRow
                key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
                masterLineData={masterLineData}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
