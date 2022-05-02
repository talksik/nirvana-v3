import { useEffect, useState } from "react";

import { $maxNumberActiveStreams } from "../../controller/recoil";
import { $numberActiveLines } from "../../controller/recoil";
import { OVERLAY_ONLY_INITIAL_PRESET } from "../../electron/constants";
import { useRecoilState } from "recoil";

export default function Overlay() {
  /** how many lines have someone broadcasting in them */
  const [numActiveLines, setNumActiveLines] =
    useRecoilState($numberActiveLines);
  const [maxNumActiveStreams, setMaxNumActiveStreams] = useRecoilState(
    $maxNumberActiveStreams
  );

  // initially, have these set to default
  useEffect(() => {
    setNumActiveLines(1);
    setMaxNumActiveStreams(1);
  }, []);

  // TODO: get all of the toggle tuned in lines and any line that I am toggle broadcasting to
  //    loop through and send lineId to the x child stream overlay components who will do the work

  const addActiveLine = () => {
    setNumActiveLines((prevNum) => prevNum + 1);
  };

  const addAnotherStream = () => {
    setMaxNumActiveStreams((prevNum) => prevNum + 1);
  };

  return (
    <div className="flex flex-col bg-transparent">
      <img
        className="w w-fit"
        src="https://miro.medium.com/max/1200/1*hONz6Wttkst4FUp_0hwQJQ.png"
      />

      <button onClick={addActiveLine}>add column</button>
      <button onClick={addAnotherStream}>add row</button>
    </div>
  );
}
