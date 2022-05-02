import { useMemo, useState } from "react";

import { FaPlus } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import { ILineDetails } from "../router";
import IconButton from "../../components/Button/IconButton/index";
import LineRow from "../../components/lines/lineRow.tsx/index";
import NewLineModal from "./newLine";

export default function NirvanaTerminal({
  handleSelectLine,
  allLines,
}: {
  handleSelectLine: (lineId: string) => void;
  allLines: ILineDetails[];
}) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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
      <div className="bg-gray-100 flex flex-col">
        {/* tuned in header + general controls */}
        <div className="flex flex-row items-center p-3 pb-0">
          <span className="flex flex-row gap-2 items-center justify-start text-slate-800">
            <FiActivity className="text-sm" />

            <h2 className="text-inherit font-semibold text-sm">Tuned In</h2>

            <p className="text-slate-300 text-xs">3/5</p>
          </span>

          <div onClick={() => setIsModalVisible(true)} className="ml-auto">
            <IconButton>
              <FaPlus />
            </IconButton>
          </div>
        </div>

        {/* list of all lines */}
        <div className="flex flex-col mt-2">
          {toggleTunedLines.map((line) => (
            <LineRow lineDetails={line} onClick={handleSelectLine} />
          ))}
        </div>
      </div>

      {/* rest of the lines */}

      <div className={"flex flex-col"}>
        {restLines.map((line) => (
          <LineRow lineDetails={line} onClick={handleSelectLine} />
        ))}
      </div>
    </div>
  );
}
