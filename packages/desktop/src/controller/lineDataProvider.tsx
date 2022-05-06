import { $jwtToken, $selectedLineId } from "./recoil";
import {
  ConnectToLine,
  SomeoneConnected,
  SomeoneTuned,
  UserBroadcastPull,
  UserBroadcastingPush,
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
  handleUserBroadcast: (lineId: string, isTurningOn: boolean) => void;
}

const LineDataContext = React.createContext<ILineDataContext>({
  linesMap: {},
  relevantUsers: [],
  handleUserBroadcast: (lineId: string, isTurningOn: boolean = true) => {},
});

let $ws: Socket;

export function LineDataProvider({ children }) {
  // TODO: have internal loading to prevent showing even router and all if something is not ready
  // or have it within each property within the context value

  // persistent store of lines
  // ?just do simple synchronous axios/fetch in useEffect and manage isLoading ourselves?
  const { data: basicUserLinesData } = useUserLines();
  const jwtToken = useRecoilValue($jwtToken);

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

    // when me or anyone just initially connects to line
    $ws.on(
      SocketChannels.SOMEONE_CONNECTED_TO_LINE,
      (res: SomeoneConnected) => {
        // TODO: change the correct masterLineData to contain this

        console.log(
          `connected to line...here are all of the users in the conected line ${res.lineId}`,
          res.allConnectedIntoUserIds
        );
      }
    );

    // whether toggle tuned or temporarily
    $ws.on(SocketChannels.SOMEONE_TUNED_TO_LINE, (res: SomeoneTuned) => {
      // TODO: change the correct master line data to show user who's tuned in

      toast(
        `another user (${res.userId}) tuned into line ${res.lineId} that you are in also`
      );

      console.log(
        `here are all of the users in the tuned in room`,
        res.allTunedIntoUserIds
      );
    });

    $ws.on(
      SocketChannels.USER_BROADCAST_PUSH_PULL,
      (pull: UserBroadcastPull) => {
        toast.success(
          `someone or myself buzz on or off in line ${pull.lineId}`
        );

        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          // todo: check if it's the user or someone else broadcasting

          if (newMap[pull.lineId])
            newMap[pull.lineId].isUserBroadcasting = pull.isTurningOn;

          return newMap;
        });
      }
    );
  }, [setLinesMap]);

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

          handleConnectToLine(masterLine.lineDetails._id.toString());

          // tune into lines
        });

        return newMap;
      });
    }
  }, [basicUserLinesData]);

  const handleConnectToLine = (lineId: string) => {
    $ws.emit(SocketChannels.CONNECT_TO_LINE, new ConnectToLine(lineId));
  };

  /**
   * toggle into a specific line
   * @param temporary: denotes whether we are just listening in or want to persist "toggling" it on so that it shows up in overlay
   * TODO: have loading state for this particular part of context value
   */
  const handleTuneToLine = (lineId: string, turnToggleOn: boolean = false) => {
    // they already are in the socket room for updates including media connections and disconnections
    // but set the flag so that the line row can know whether or not to start the webrtc process
    // and know when to get out or disconnect from the webrtc when the flag turns off
    // $ws.emit(SocketChannels.TUNE_INTO_LINE, new TuneIntoLine(lineId));
  };

  /**
   * This is when the user wants to tell everyone that they are streaming/broadcasting/buzzing to
   * a specific line, whether they are toggle tuned or temporarily tuned in
   *
   * Note: They could be using push to talk or toggle broadcast
   *
   * Note: this is handling the data transmission as is the responsibility of this overall context provider
   * and not necessarily the aspect of enabling and disabling streaming as webrtc is reliable enough for that
   *
   * @param lineId the line that the current user is talking into
   */
  const handleUserBroadcast = useCallback(
    (lineId: string, isTurningOn: boolean = true) => {
      // emit telling people
      $ws.emit(
        SocketChannels.USER_BROADCAST_PUSH_PULL,
        new UserBroadcastingPush(lineId, isTurningOn)
      );

      // ?handle recording here as well? or record the incoming stream instead?
      // ?could just take in the audiochunks here and all, but not sure yet
    },
    [$ws]
  );

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
    handleUserBroadcast,
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
