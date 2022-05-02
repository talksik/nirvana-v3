import {
  $maxNumberActiveStreams,
  $numberActiveLines,
} from "../../controller/recoil";
import Channels, {
  DimensionChangeRequest,
  Dimensions,
  OVERLAY_ONLY_INITIAL_PRESET,
  TERMINAL_DETAILS_PRESET,
  TERMINAL_PRESET,
} from "../../electron/constants";
import React, { useState } from "react";
import { useCallback, useEffect, useMemo } from "react";

import LineDetailsTerminal from "../lineDetailsTerminal";
import NirvanaHeader from "../../components/header/index";
import NirvanaTerminal from "../terminal";
import Overlay from "../overlay";
import { useRecoilValue } from "recoil";

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

class LineDetails implements ILineDetails {
  constructor(
    public lineId: string,
    public name: string,
    public profilePictures: string[],
    public numberMembers: number,

    public isUserToggleTunedIn: boolean,

    public isUserBroadcastingHere: boolean,
    public isSomeoneElseBroadcastingHere: boolean,
    public streamImages: string[],

    public audioBlocks: {
      creatorProfilePicture: string;
      creatorName: string;
      lengthOfClip: number;
      relativeTimeAgo: string;
    }[],
    public timeAgo: string,

    public hasNewActivity: boolean,

    public profilePicsLiveBroadcasters?: string[]
  ) {}
}
const testLines: ILineDetails[] = [
  new LineDetails(
    "line1",
    "Poggers",
    [
      "data:image/jpeg;base64,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",
    ],
    7,
    true,
    false,
    false,
    [],
    [],
    "3m ago",
    true
  ),

  new LineDetails(
    "line2",
    "Viet Phan",
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAqAZG7zLGhZIxSUV6EVLfQX3WEUawmvM-eA&usqp=CAU",
    ],
    2,
    true,
    false,
    false,
    [],
    [],
    "3m ago",
    false
  ),

  new LineDetails(
    "line3",
    "Level & Vanguard | Follow Up...",
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvxDrCR5SfO2zzeBNLF9U9xbjlC8-ToAA68g&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuhO9a_BfEPT5RNEunoAkxFFKZbnMWopS52g&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzHQv_th9wq3ivQ1CVk7UZRxhbPq64oQrg5Q&usqp=CAU",
    ],
    5, // num members
    true, // is user toggle tuned in
    false, // is user broadcasting here
    false, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "yesterday", // time ago
    true //has new activity
  ),

  new LineDetails(
    "line4",
    "Level | Infra",
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXbmKVEinDjkWi-hJdRFy9Xq3KQCKLWmxYzw&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT126oVRFEmRXwBWV7i6ITvXWU7FKIXl7y8ZQ&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnsDI9CSc_tlfeWgA-ZtBb7NILMUMaEzuCKA&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSi5kq0gJbMH6aY7Y-O6lq3F_C-WPXYP8Yqg&usqp=CAU",
    ],
    20, // num members
    false, // is user toggle tuned in
    true, // is user broadcasting here
    true, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "yesterday", // time ago
    true, //has new activity
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsQ-YHX2i3RvTDDmpfnde4qyb2P8up7Wi3Ww&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjaNcG-tBxvlbCZ5DU6nsHSaCY_j1IcDAw9w&usqp=CAU",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0s-_blb4lEdA99WhU9RvWXWRskaHJA4snyQ&usqp=CAU",
    ] // live broadcasters images
  ),

  new LineDetails(
    "line5",
    "Sahaj, Heran & 5 others",
    [
      "data:image/jpeg;base64,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",
      "data:image/jpeg;base64,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",
    ],
    7, // num members
    false, // is user toggle tuned in
    false, // is user broadcasting here
    true, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "right now", // time ago
    true, //has new activity
    [
      "https://miro.medium.com/fit/c/176/176/1*W4xfRqvOk3Ck1DYNlyXHYg.jpeg",
      "https://media-exp1.licdn.com/dms/image/C5103AQFgKwuJl4wlPw/profile-displayphoto-shrink_200_200/0/1526555748918?e=1655337600&v=beta&t=HzhdJxL2hsrDLIM7ejj-_To5Sy7kE51jUxKK4CNsHYo",
    ] // live broadcasters images
  ),

  new LineDetails(
    "line6",
    "Tess Rickert",
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU4g8xUnnDU4kVOp8_-3f3aPDusw_D2AlyXw&usqp=CAU",
    ],
    2, // num members
    false, // is user toggle tuned in
    false, // is user broadcasting here
    true, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "wednesday", // time ago
    true, //has new activity
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU4g8xUnnDU4kVOp8_-3f3aPDusw_D2AlyXw&usqp=CAU",
    ] // live broadcasters images
  ),

  new LineDetails(
    "line7",
    "Thomas Shelby",
    [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLsupI89wVbXLRzxaiHG_rezqk3FrqDeMmog&usqp=CAU",
    ],
    2, // num members
    false, // is user toggle tuned in
    false, // is user broadcasting here
    false, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "last week", // time ago
    false, //has new activity
    [] // live broadcasters images
  ),

  new LineDetails(
    "line8",
    "Nirvana Support",
    [],
    2, // num members
    false, // is user toggle tuned in
    false, // is user broadcasting here
    false, // is someone else broadcasting here
    [], // stream images
    [], //audio blocks
    "last month", // time ago
    false, //has new activity
    [] // live broadcasters images
  ),
];

type DesktopMode = "flowState" | "overlayOnly" | "terminal" | "terminalDetails";

export default function NirvanaRouter() {
  const [selectedLineId, setSelectedLineId] = useState<string>(null);
  const [desktopMode, setDesktopMode] = useState<DesktopMode>("terminal");
  const numberOfOverlayColumns = useRecoilValue($numberActiveLines);
  const numberOfOverlayRows = useRecoilValue($maxNumberActiveStreams);

  // on window blur, put app in overlay only mode
  useEffect(() => {
    window.electronAPI.on(Channels.ON_WINDOW_BLUR, () => {
      console.log(
        "window blurring now, should be always on top and then ill tell main process to change dimensions"
      );
      // todo: just in testing mode
      // setDesktopMode("overlayOnly");
    });
  }, [setDesktopMode]);

  // handle all window resizing logic
  useEffect(() => {
    // always have overlay so need to calculate that
    const overlayDimensions: Dimensions = {
      height: 50 + numberOfOverlayRows * 200,
      width: 350 * numberOfOverlayColumns,
    };
    const setAlwaysOnTop = desktopMode === "overlayOnly";

    // add dimensions if it's not overlay only mode
    let finalDimensions: Dimensions = { height: 0, width: 0 };

    if (desktopMode === "terminal")
      finalDimensions = { height: 675, width: 400 };
    if (desktopMode === "terminalDetails")
      finalDimensions = { height: 675, width: 800 };
    if (desktopMode === "flowState")
      finalDimensions = { height: 50, width: 325 };

    if (desktopMode !== "flowState")
      finalDimensions = {
        width: finalDimensions.width + overlayDimensions.width,
        height: Math.max(finalDimensions.height, overlayDimensions.height),
      };

    console.log(
      "setting new dimensions",
      desktopMode,
      numberOfOverlayColumns,
      numberOfOverlayRows,
      overlayDimensions,
      finalDimensions,
      setAlwaysOnTop
    );

    // send the final dimensions to main process
    window.electronAPI.window.resizeWindow({
      setAlwaysOnTop,
      dimensions: {
        height: finalDimensions.height,
        width: finalDimensions.width,
      },
      addDimensions: false,
    });
  }, [desktopMode, numberOfOverlayColumns, numberOfOverlayRows]);

  /** show user line details */
  const handleSelectLine = useCallback(
    (lineId: string) => {
      setSelectedLineId(lineId);
      setDesktopMode("terminalDetails");
    },
    [setSelectedLineId, setDesktopMode]
  );

  const handleToggleFlowState = useCallback(() => {
    setDesktopMode("flowState");
  }, [setDesktopMode]);

  const selectedLine = useMemo(
    () => testLines.find((line) => line.lineId === selectedLineId),
    [testLines, selectedLineId]
  );

  return (
    <div className="flex flex-col">
      <NirvanaHeader onHeaderFocus={() => setDesktopMode("terminal")} />

      <div className="flex flex-row flex-1">
        {(desktopMode === "terminal" || desktopMode === "terminalDetails") && (
          <NirvanaTerminal
            handleSelectLine={handleSelectLine}
            allLines={testLines}
          />
        )}

        {desktopMode === "terminalDetails" && selectedLine && (
          <LineDetailsTerminal selectedLine={selectedLine} />
        )}

        <Overlay />
      </div>
    </div>
  );
}
