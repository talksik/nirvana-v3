import { ILineDetails } from "../router";
import LineIcon from "../../components/lines/lineIcon/index";

export default function LineDetailsTerminal({
  selectedLine,
}: {
  selectedLine: ILineDetails;
}) {
  return (
    <div
      id={`${selectedLine.lineId}-lineDetailsTerminal`}
      className="flex flex-col flex-1 bg-gray-100 h-full"
    >
      {/* line overview header */}
      <div className="flex flex-row p-3 items-center gap-1">
        <LineIcon sourceImages={selectedLine.profilePictures} />

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
        </span>
      </div>
    </div>
  );
}
