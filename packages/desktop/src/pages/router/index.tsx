import { DimensionPresets, Dimensions } from "../../electron/constants";
import React, { useState } from "react";

import LineDetails from "../lineDetails";
import NirvanaTerminal from "../terminal";
import Overlay from "../overlay";
import { Search } from "carbon-components-react";
import { useEffect } from "react";

export default function NirvanaRouter() {
  const [desktopMode, setDesktopMode] = useState<Dimensions>(
    DimensionPresets.terminalDetailOverlay
  );

  useEffect(() => {
    window.electronAPI.window.resizeWindow(desktopMode);
  }, [desktopMode]);

  return (
    <div className="h-screen w-screen flex flex-row">
      <NirvanaTerminal />

      <LineDetails />

      <Overlay />
    </div>
  );
}
