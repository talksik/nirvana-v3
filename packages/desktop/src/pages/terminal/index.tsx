import { Button, Search } from "@carbon/react";

import { Add } from "@carbon/react/icons";
import NirvanaHeader from "../../components/header";

export default function NirvanaTerminal() {
  return (
    <div className="flex flex-col flex-1">
      <NirvanaHeader />

      <div className="flex flex-row m-2 gap-2">
        <Search
          closeButtonLabelText="Clear search input"
          id="search-1"
          placeholder={"search for anything someone said or shared"}
          onChange={function noRefCheck() {}}
          onKeyDown={function noRefCheck() {}}
          size="sm"
        />

        <Button
          size="sm"
          kind="secondary"
          hasIconOnly
          renderIcon={Add}
          iconDescription="New line"
        />
      </div>
    </div>
  );
}
