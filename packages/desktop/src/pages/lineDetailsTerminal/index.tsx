import { ILineDetails } from "../router";

export default function LineDetailsTerminal({
  selectedLine,
}: {
  selectedLine: ILineDetails;
}) {
  return (
    <div className="flex flex-col flex-1">
      this is the line details for {selectedLine.name}
    </div>
  );
}
