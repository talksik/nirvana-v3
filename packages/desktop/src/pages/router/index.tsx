import {
  $desktopMode,
  $maxNumberActiveStreams,
  $numberActiveLines,
  $selectedLineId,
} from "../../controller/recoil";
import Channels, { Dimensions } from "../../electron/constants";
import { useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { LineDataProvider } from "../../controller/lineDataProvider";
import NirvanaHeader from "../../components/header/index";
import NirvanaTerminal from "../terminal";
import Overlay from "../overlay";

export interface ILineDetails {
  lineId: string;
  name: string;

  profilePictures: string[];
  numberMembers: number;

  isUserToggleTunedIn: boolean;

  isUserBroadcastingHere: boolean;
  isSomeoneElseBroadcastingHere: boolean;
  streamImages: string[];

  audioBlocks: {
    creatorProfilePicture: string;
    creatorName: string;
    lengthOfClip: number;
    relativeTimeAgo: string;
  }[];
  timeAgo: string;

  hasNewActivity: boolean;

  profilePicsLiveBroadcasters?: string[];
}

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

    const setAlwaysOnTop =
      desktopMode === "overlayOnly" || desktopMode === "flowState";

    // go hunting for which dimensions to have
    if (desktopMode === "terminal") {
      finalPosition = "center";
      finalDimensions = { height: 675, width: 400 };
    }
    if (desktopMode === "terminalDetails") {
      finalDimensions = { height: 675, width: 800 };
    }
    if (desktopMode === "flowState") {
      finalPosition = "topRight";
      finalDimensions = { height: 68, width: 360 };
    }
    if (desktopMode === "overlayOnly") {
      finalPosition = "topRight";
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

  // handling desktop mode switch on change of selected line
  useEffect(() => {
    if (selectedLineId && desktopMode === "terminal") {
      console.log("selected line right now", selectedLineId);
      setDesktopMode("terminalDetails");
    } else if (!selectedLineId && desktopMode === "terminalDetails")
      setDesktopMode("terminal");

    // TODO: add more cases step by step based on experience I want
  }, [selectedLineId, desktopMode, setDesktopMode]);

  const handleToggleFlowState = useCallback(() => {
    setDesktopMode("flowState");
  }, [setDesktopMode]);

  return (
    <LineDataProvider>
      <div className="flex flex-col flex-1">
        <NirvanaHeader onHeaderFocus={() => setDesktopMode("terminal")} />

        <NirvanaTerminal />
      </div>
    </LineDataProvider>
  );
}
