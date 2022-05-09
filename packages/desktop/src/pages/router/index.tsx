import {
  $desktopMode,
  $maxNumberActiveStreams,
  $numberActiveLines,
  $selectedLineId,
} from "../../controller/recoil";
import Channels, {
  DEFAULT_APP_PRESET,
  Dimensions,
} from "../../electron/constants";
import { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { LineDataProvider } from "../../controller/lineDataProvider";
import NirvanaHeader from "../../components/header/index";
import NirvanaTerminal from "../terminal";
import Overlay from "../overlay";

export default function NirvanaRouter() {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const [desktopMode, setDesktopMode] = useRecoilState($desktopMode);
  const numberOfOverlayColumns = useRecoilValue($numberActiveLines);
  const numberOfOverlayRows = useRecoilValue($maxNumberActiveStreams);

  // handle all window resizing logic
  useEffect(() => {
    // add dimensions if it's not overlay only mode
    let finalDimensions: Dimensions = { height: 0, width: 0 };
    let finalPosition: "center" | "topRight";

    const setAlwaysOnTop = desktopMode === "overlayOnly";

    // go hunting for which dimensions to have
    if (desktopMode === "terminal" || desktopMode == "flowState") {
      finalDimensions = DEFAULT_APP_PRESET;
    }

    if (desktopMode === "overlayOnly") {
      finalDimensions = {
        height: 68 + numberOfOverlayRows * 200,
        width: 360 + 360 * numberOfOverlayColumns,
      };
    }

    console.log(
      "setting new dimensions",
      desktopMode,
      numberOfOverlayColumns,
      numberOfOverlayRows,
      finalDimensions,
      setAlwaysOnTop
    );

    // send the final dimensions to main process
    window.electronAPI.window.resizeWindow({
      setAlwaysOnTop: true, // TODO: remove, just this for testing
      dimensions: {
        height: finalDimensions.height,
        width: finalDimensions.width,
      },
      setPosition: finalPosition,
      addDimensions: false,
    });
  }, [desktopMode, numberOfOverlayColumns, numberOfOverlayRows]);

  // on window blur, put app in overlay only mode
  // get rid of selected line from terminal if we had any...

  useEffect(() => {
    window.electronAPI.on(Channels.ON_WINDOW_BLUR, () => {
      console.log(
        "window blurring now, should be always on top and then ill tell main process to change dimensions"
      );
      // TODO: testing mode... uncomment both instructions below
      // setDesktopMode("overlayOnly");

      // todo: make sure that if I am toggle broadcasted into a line, then don't deselect selected line
      // the overlay should be showing selected line if I am broadcasting toggled into it as well as of course all other toggle tuned ones
      // setSelectedLineId(null);
    });
  }, [setDesktopMode, setSelectedLineId]);

  return (
    <div className="flex flex-col flex-1">
      <NirvanaHeader onHeaderFocus={() => setDesktopMode("terminal")} />

      {desktopMode === "flowState" && <FlowState />}

      {/* remount nirvana terminal */}
      {(desktopMode === "terminal" || desktopMode === "overlayOnly") && (
        <LineDataProvider>
          <NirvanaTerminal overlayOnly={desktopMode === "overlayOnly"} />
        </LineDataProvider>
      )}
    </div>
  );
}

function FlowState() {
  useEffect(() => {
    fetch("http://zenquotes.io/api/random", { method: "GET" })
      .then((res) => {
        console.log(res);
      })
      .catch(() => {
        // do nothing, don't bother user, just don't show the quote
      });
  }, []);

  return <>{}</>;
}
