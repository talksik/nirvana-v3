import { $desktopMode, $jwtToken, $selectedLineId } from "./recoil";
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
  UntuneFromLineRequest,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
} from "@nirvana/core/sockets/channels";
import React, { useContext, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useCallback, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { LineMemberState } from "@nirvana/core/models/line.model";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { User } from "@nirvana/core/models";
import { queryClient } from "../pages/nirvanaApp";
import toast from "react-hot-toast";
import { useUserLines } from "./index";

let $ws: Socket;

function useSocketHandler(linesData: MasterLineData[]) {
  const jwtToken = useRecoilValue($jwtToken);

  const [linesMap, setLinesMap] = useState<LineIdToMasterLine>({});
  const setDesktopMode = useSetRecoilState($desktopMode);

  /**
   * handle ws connection
   */

  // ! POTENTIAL DIAGNOSIS with socket reconnections on electron idle causing
  // no more event listeners being fired off: potentially because the listeners were for an older manager or instance
  // so when the client reconnects, with another instance, the old listeners are lost
  // https://stackoverflow.com/questions/34984980/socket-io-not-receiving-emit-data-after-reconnect
  // https://socket.io/docs/v4/client-options/#reconnection

  useEffect(() => {
    $ws = io("http://localhost:5000", {
      query: { token: jwtToken },
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
      reconnection: false, // ! TESTING THE PROBLEM WITH RECONNECTION CLIENT LISTENERS NOT ACTIVATING
    });

    $ws.on("connect", () => {
      console.log(
        "SOCKETS | CLIENT CONNECTED in socket handler, setting up client side listeners for requests"
      );
      toast.success("you are connected");

      /**
       * initiate listeners
       */

      /**
       * TODO: P0 : notified that someone else added me to a line they created
       */
      // 1. get the new line from axios or just from the ws itself
      // 2. add it to the lines map with all of the right data
      // 3. make sure to connect to it as if it's inbox material

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

            if (newMap[res.lineId]) {
              newMap[res.lineId].tunedInMemberIds = res.allTunedIntoUserIds;

              // if user is me, make sure to show me my updated line member association
              if (
                newMap[res.lineId].currentUserMember?.userId.toString() ===
                res.userId
              ) {
                newMap[res.lineId].currentUserMember.lastVisitDate = new Date();
                newMap[res.lineId].currentUserMember.state = res.toggledIn
                  ? LineMemberState.TUNED
                  : LineMemberState.INBOX;
              }

              // TODO: update the relevant lineMember (based on which userId is given): state and last visit date if current user is joining
              // and not just if it's the current user toggling in
              // right now, we just want user to know number of folks tuned and no need to expose who is toggle tuned...that lineMember can be stale
            }

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
    });

    // on disconnections, just switch it to flow state?
    // what if there was another problem?
    $ws.io.on("close", () => {
      console.error(
        "SOCKET | there was a problem with your app...connection closed likely due to idling or manual disconnect"
      );
      // todo: figure out the right thing based on the situation whether it's a problem or user unplugs
      // toast(
      //   "Disconnected due to idling or some other issue. Please reconnect or refresh to fix the problem."
      // );

      toast("unplugging");
      setDesktopMode("flowState");
    });

    // client-side errors
    $ws.on("connect_error", (err) => {
      console.error(`SOCKETS | ${err.message}`); // prints the message associated with the error
      toast.error("sorry...this is our bad...please refresh with cmd + r");

      // force refetch of server status as well as these generally go hand in hand

      // this should overall remount this component currently which is what we want for new data
      queryClient.invalidateQueries("SERVER_CHECK");
    });

    // on unmounting this component, we want to disconnect
    return () => {
      $ws.disconnect();
    };
  }, []);

  /** handle initial data coming in and creating the initial line map
   * and doing initial connections/tune ins ?could trigger this later?
   */
  useEffect(() => {
    if (linesData?.length > 0) {
      setLinesMap((prevMappings) => {
        // go through the lines from the persistent store

        // get all of the id's and map assign to the main object

        // ?prolly have no previous at this point...but I'm okay with override since this
        // ?useeffect is triggered on the refetching of the persistent store so we
        // ?are prolly looking to do a full app refresh and connection refresh
        const newMap = { ...prevMappings };

        linesData.forEach((masterLine) => {
          const lineId = masterLine.lineDetails._id.toString();
          newMap[lineId] = masterLine;

          handleConnectToLine(lineId);

          // tune into lines that I should be
          if (masterLine.currentUserMember.state === LineMemberState.TUNED) {
            // don't need to turn toggle on, it's already on
            // ! CHANGE PARADIGM TO NOT INCLUDING TOGGLING IN REQUESTS WITH THE SAME AS TUNING IN
            // right now, writing just because of later logic
            handleTuneToLine(lineId, true);
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

  const handleUnTuneToLine = useCallback(
    (lineId: string) => {
      // they already are in the socket room for updates including media connections and disconnections
      // but set the flag so that the line row can know whether or not to start the webrtc process
      // and know when to get out or disconnect from the webrtc when the flag turns off

      $ws.emit(
        ServerRequestChannels.UNTUNE_FROM_LINE,
        new UntuneFromLineRequest(lineId)
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

  /**
   * TODO: handle telling overall current client that we are finally rtc connected  for a certain line
   */

  // TODO: move all of these emitters to just having child views doing the work here
  return {
    linesMap,
    handleConnectToLine,
    handleTuneToLine,
    handleStartBroadcast,
    handleStopBroadcast,
    handleFetchMoreAudioBlocks,
    handleUnTuneToLine,
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
  const desktopMode = useRecoilValue($desktopMode);

  // ! passing in the same data of the query passes reference so changes that happen in socketHandler impact react query cache
  const { linesMap, ...handlers } = useSocketHandler(
    basicUserLinesData?.data?.masterLines
  );

  // TODO: not complete...not sure of priority of this
  // if we go into flow state
  // emit flow state message to all of my rooms
  // persist it in my user object
  // and then disconnect
  useEffect(() => {
    return () => {
      if (desktopMode === "flowState" && $ws) {
        console.log(
          "SOCKETS | telling all of my connected rooms that I am unplugging"
        );

        $ws.emit(ServerRequestChannels.GOING_INTO_FLOW_STATE);
      }
    };
  }, [desktopMode, $ws]);

  // avoid children rendering if they don't have the ws to make individual calls with
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