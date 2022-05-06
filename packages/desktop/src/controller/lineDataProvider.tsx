import { $jwtToken, $selectedLineId } from "./recoil";
import {
  ConnectToLine,
  SomeoneConnected,
} from "@nirvana/core/sockets/channels";
import React, { useContext } from "react";
import { Socket, io } from "socket.io-client";
import { useCallback, useEffect, useState } from "react";

import MasterLineData from "@nirvana/core/models/masterLineData.model";
import SocketChannels from "@nirvana/core/sockets/channels";
import { User } from "@nirvana/core/models";
import { queryClient } from "../pages/nirvanaApp";
import toast from "react-hot-toast";
import { useRecoilValue } from "recoil";
import { useUserLines } from "./index";

type LineIdToMasterLine = {
  [lineId: string]: MasterLineData;
};
interface ILineDataContext {
  // represents the modified and up to date lines data with availability from session
  linesMap: LineIdToMasterLine;
  relevantUsers: User[];
}

const LineDataContext = React.createContext<ILineDataContext>({
  linesMap: {},
  relevantUsers: [],
});

let $ws: Socket;

export function LineDataProvider({ children }) {
  // TODO: have internal loading to prevent showing even router and all if something is not ready
  // or have it within each property within the context value

  // persistent store of lines
  // ?just do simple synchronous axios/fetch in useEffect and manage isLoading ourselves?
  const { data: basicUserLinesData } = useUserLines();
  const jwtToken = useRecoilValue($jwtToken);
  const selectedLineId = useRecoilValue($selectedLineId);

  const [linesMap, setLinesMap] = useState<LineIdToMasterLine>({});

  useEffect(() => {
    $ws = io("http://localhost:5000", {
      query: { token: jwtToken },
    });

    $ws.on("connect", () => toast.success("you are connected"));

    // client-side errors
    $ws.on("connect_error", (err) => {
      console.error(err.message); // prints the message associated with the error
      toast.error("sorry...this is our bad...please refresh with cmd + r");

      // force refetch of server status as well as these generally go hand in hand

      // this should overall remount this component currently which is what we want for new data
      queryClient.invalidateQueries("SERVER_CHECK");
    });

    $ws.on(
      SocketChannels.SOMEONE_CONNECTED_TO_LINE,
      (res: SomeoneConnected) => {
        toast(
          `another user (${res.userId}) tuned into line ${res.lineId} that you are in also`
        );
      }
    );
  }, []);

  // connect through ws to enrich basic lines data
  useEffect(() => {
    console.log("got basic user lines data!!!");

    // ?need to calculate diff and only do stuff then?

    // $ws.on(SocketChannels.CONNECT, console.log());

    $ws.on("test", () => console.log("test"));

    if (basicUserLinesData?.data?.masterLines.length > 0) {
      setLinesMap((prevMappings) => {
        // go through the lines from the persistent store

        // get all of the id's and map assign to the main object

        // ?prolly have no previous at this point...but I'm okay with override since this
        // ?useeffect is triggered on the refetching of the persistent store so we
        // ?are prolly looking to do a full app refresh and connection refresh
        const newMap = { ...prevMappings };

        basicUserLinesData.data.masterLines.map((masterLine) => {
          newMap[masterLine.lineDetails._id.toString()] = masterLine;
        });

        return newMap;
      });
    }
  }, [basicUserLinesData]);

  // on change of line Id, we want to toggle tune into the line
  useEffect(() => {
    if (selectedLineId) handleToggleTune(selectedLineId, true, true);
  }, [selectedLineId]);

  /**
   * toggle into a specific line
   * @param temporary: denotes whether we are just listening in or want to persist "toggling" it on so that it shows up in overlay
   * TODO: have loading state for this particular part of context value
   */

  const handleToggleTune = (
    lineId: string,
    turnOn: boolean = true,
    temporary: boolean = true
  ) => {
    // they already are in the socket room for updates including media connections and disconnections
    // but set the flag so that the line row can know whether or not to start the webrtc process
    // and know when to get out or disconnect from the webrtc when the flag turns off

    $ws.emit(SocketChannels.CONNECT_TO_LINE, new ConnectToLine(lineId));
  };

  /**
   * get more audio blocks for a certain line
   */
  const handleFetchMoreAudioBlocks = useCallback(
    (lineId: string) => {
      // simple axios fetch for this specific block
      // update the specific line in lines map
      // set the state to trigger the re-renders in the tree
    },
    [setLinesMap]
  );

  const value: ILineDataContext = {
    linesMap, // TODO send the updated map instead of this array
    relevantUsers: [],
  };

  return (
    <LineDataContext.Provider value={value}>
      {children}
    </LineDataContext.Provider>
  );
}

export function useLineDataProvider() {
  return useContext(LineDataContext);
}
