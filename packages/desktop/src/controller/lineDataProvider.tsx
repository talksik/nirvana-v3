import { $jwtToken, $selectedLineId } from "./recoil";
import {
  ConnectToLineRequest,
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  StartBroadcastingRequest,
  StopBroadcastingRequest,
  TuneToLineRequest,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
} from "@nirvana/core/sockets/channels";
import React, { useContext, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useCallback, useEffect } from "react";

import { LineMemberState } from "@nirvana/core/models/line.model";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { User } from "@nirvana/core/models";
import { queryClient } from "../pages/nirvanaApp";
import toast from "react-hot-toast";
import { useRecoilValue } from "recoil";
import { useUserLines } from "./index";

let $ws: Socket;

function useSocketHandler(linesData: MasterLineData[]) {
  const jwtToken = useRecoilValue($jwtToken);

  const [linesMap, setLinesMap] = useState<LineIdToMasterLine>({});

  /**
   * handle ws connection
   */
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
  }, []);

  /**
   * initiate listeners
   */
  useEffect(() => {
    // when me or anyone just initially connects to line
    $ws.on(
      ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE,
      (res: SomeoneConnectedResponse) => {
        console.log(
          `connected to line...here are all of the updated in the conected line ${res.lineId}...this isn't reliable considering it's not updated later`,
          res.allConnectedIntoUserIds
        );

        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          if (newMap[res.lineId])
            newMap[res.lineId].connectedMemberIds = [
              ...(newMap[res.lineId]?.connectedMemberIds ?? []),
              res.userId,
            ];

          return newMap;
        });
      }
    );

    // someone tuning in, including perhaps me | either toggled in or just temporary
    $ws.on(
      ServerResponseChannels.SOMEONE_TUNED_INTO_LINE,
      (res: SomeoneTunedResponse) => {
        console.log(
          `here are all of updated users in the tuned in room`,
          res.allTunedIntoUserIds
        );

        // TODO: if toggled in, make sure to update the current line member in the lines map so that
        // we can know to untune if user selects another line

        // below, we are setting the list of tuned in folks based on fresh list from the server
        //   better than just adding and removing? i think so, but have to handle not interrupting existing peer connections as this changes
        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          // TODO: update the relevant lineMember (based on which userId is given): state and last visit date if current user is joining

          if (newMap[res.lineId])
            newMap[res.lineId].tunedInMemberIds = res.allTunedIntoUserIds;

          return newMap;
        });
      }
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
      (res: SomeoneUntunedFromLineResponse) => {
        console.log(
          `here are all of updated users in the tuned in room`,
          res.allTunedIntoUserIds
        );

        // TODO: if toggled in, make sure to update the current line member in the lines map so that
        // we can know to untune if user selects another line

        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          // TODO: update the relevant lineMember (based on which userId is given): state and last visit date if current user is joining

          if (newMap[res.lineId])
            newMap[res.lineId].tunedInMemberIds = res.allTunedIntoUserIds;

          return newMap;
        });
      }
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STARTED_BROADCASTING,
      (res: UserStartedBroadcastingResponse) => {
        console.log("someone is starting to broadcast");

        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          if (newMap[res.lineId])
            newMap[res.lineId].currentBroadcastersUserIds = [
              ...(newMap[res.lineId].currentBroadcastersUserIds ?? []),
              res.userId,
            ];

          return newMap;
        });
      }
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STOPPED_BROADCASTING,
      (res: UserStoppedBroadcastingResponse) => {
        setLinesMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          if (newMap[res.lineId]?.currentBroadcastersUserIds) {
            newMap[res.lineId].currentBroadcastersUserIds = newMap[
              res.lineId
            ].currentBroadcastersUserIds.filter(
              (broadcasterUserId) => broadcasterUserId !== res.userId
            );
          }

          return newMap;
        });
      }
    );
  }, [setLinesMap]);

  /** handle initial data coming in and creating the initial line map
   * and doing initial connections/tune ins ?could trigger this later?
   */
  useEffect(() => {
    if (linesData?.length > 0) {
      console.log("going to make initial connections and create lines map");

      setLinesMap((prevMappings) => {
        // go through the lines from the persistent store

        // get all of the id's and map assign to the main object

        // ?prolly have no previous at this point...but I'm okay with override since this
        // ?useeffect is triggered on the refetching of the persistent store so we
        // ?are prolly looking to do a full app refresh and connection refresh
        const newMap = { ...prevMappings };

        linesData.map((masterLine) => {
          const lineId = masterLine.lineDetails._id.toString();
          newMap[lineId] = masterLine;

          handleConnectToLine(lineId);

          // tune into lines that I should be
          if (masterLine.currentUserMember.state === LineMemberState.TUNED) {
            // don't need to turn toggle on, it's already on
            handleTuneToLine(lineId, false);
          }
        });

        return newMap;
      });
    }
  }, [linesData, setLinesMap]);

  /** handlers for emitting events to server */
  const handleConnectToLine = useCallback(
    (lineId: string) => {
      $ws.emit(
        ServerRequestChannels.CONNECT_TO_LINE,
        new ConnectToLineRequest(lineId)
      );
    },
    [$ws]
  );

  /**
   * toggle into a specific line
   * @param temporary: denotes whether we are just listening in or want to persist "toggling" it on so that it shows up in overlay
   * TODO: have loading state for this particular part of context value
   */
  const handleTuneToLine = useCallback(
    (lineId: string, turnToggleOn: boolean = false) => {
      // they already are in the socket room for updates including media connections and disconnections
      // but set the flag so that the line row can know whether or not to start the webrtc process
      // and know when to get out or disconnect from the webrtc when the flag turns off

      $ws.emit(
        ServerRequestChannels.TUNE_INTO_LINE,
        new TuneToLineRequest(lineId, turnToggleOn)
      );
    },
    [$ws]
  );

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
  const handleStartBroadcast = useCallback(
    (lineId: string) => {
      // emit telling people
      $ws.emit(
        ServerRequestChannels.BROADCAST_TO_LINE,
        new StartBroadcastingRequest(lineId)
      );
    },
    [$ws]
  );

  const handleStopBroadcast = useCallback(
    (lineId: string) => {
      // emit telling people
      $ws.emit(
        ServerRequestChannels.STOP_BROADCAST_TO_LINE,
        new StopBroadcastingRequest(lineId)
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
    [$ws]
  );

  // TODO: move all of these emitters to just having child views doing the work here
  return {
    linesMap,
    handleConnectToLine,
    handleTuneToLine,
    handleStartBroadcast,
    handleStopBroadcast,
    handleFetchMoreAudioBlocks,
  };
}

type LineIdToMasterLine = {
  [lineId: string]: MasterLineData;
};
interface ILineDataContext {
  // represents the modified and up to date lines data with availability from session
  linesMap: LineIdToMasterLine;
  relevantUsers: User[];

  // in case some components need this like in the peer handling
  $ws: Socket;
}

const LineDataContext = React.createContext<
  Partial<ILineDataContext & ReturnType<typeof useSocketHandler>>
>({
  linesMap: {},
  relevantUsers: [],
  $ws: undefined,
});

export function LineDataProvider({ children }) {
  // TODO: have internal loading to prevent showing even router and all if something is not ready
  // or have it within each property within the context value

  // persistent store of lines
  // ?just do simple synchronous axios/fetch in useEffect and manage isLoading ourselves?
  const { data: basicUserLinesData } = useUserLines();

  const { linesMap, ...handlers } = useSocketHandler(
    basicUserLinesData?.data?.masterLines
  );

  if (!$ws) {
    return <span>attempting to connect you for the here and now...</span>;
  }

  const value: ILineDataContext & ReturnType<typeof useSocketHandler> = {
    linesMap, // TODO send the updated map instead of this array
    relevantUsers: [],
    $ws,
    ...handlers,
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
