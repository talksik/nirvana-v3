import React, { useEffect, useState, useCallback, useContext } from 'react';
import useRooms from './RoomsProvider';
import useSockets from './SocketProvider';

import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { LineMemberState } from '@nirvana/core/models/line.model';

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
} from '@nirvana/core/sockets/channels';

type LineIdToMasterLine = {
  [lineId: string]: MasterLineData;
};

interface IRealTimeRoomProvider {
  roomsMap: LineIdToMasterLine;
}

const RealTimeRoomContext = React.createContext<IRealTimeRoomProvider>({ roomsMap: {} });

// handles reads of new data
// does NOT handle sending socket emissions
export function RealTimeRoomProvider({ children }: { children: React.ReactChild }) {
  const { rooms } = useRooms();
  const { $ws } = useSockets();
  const [realTimeRoomMap, setRealTimeRoomMap] = useState<LineIdToMasterLine>({});

  useEffect(() => {
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
    $ws.on(ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE, (res: SomeoneConnectedResponse) => {
      console.log(
        `connected to line...here are all of the updated in the conected line ${res.lineId}...this isn't reliable considering it's not updated later`,
        res.allConnectedIntoUserIds,
      );

      setRealTimeRoomMap((prevLinesMap) => {
        const newMap = { ...prevLinesMap };

        if (newMap[res.lineId])
          newMap[res.lineId].connectedMemberIds = [
            ...(newMap[res.lineId]?.connectedMemberIds ?? []),
            res.userId,
          ];

        return newMap;
      });
    });

    // someone tuning in, including perhaps me | either toggled in or just temporary
    $ws.on(ServerResponseChannels.SOMEONE_TUNED_INTO_LINE, (res: SomeoneTunedResponse) => {
      console.log(`here are all of updated users in the tuned in room`, res.allTunedIntoUserIds);

      // TODO: if toggled in, make sure to update the current line member in the lines map so that
      // we can know to untune if user selects another line

      // below, we are setting the list of tuned in folks based on fresh list from the server
      //   better than just adding and removing? i think so, but have to handle not interrupting existing peer connections as this changes
      setRealTimeRoomMap((prevLinesMap) => {
        const newMap = { ...prevLinesMap };

        if (newMap[res.lineId]) {
          newMap[res.lineId].tunedInMemberIds = res.allTunedIntoUserIds;

          // if user is me, make sure to show me my updated line member association
          if (newMap[res.lineId].currentUserMember?.userId.toString() === res.userId) {
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
    });

    $ws.on(
      ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
      (res: SomeoneUntunedFromLineResponse) => {
        console.log(`here are all of updated users in the tuned in room`, res.allTunedIntoUserIds);

        // TODO: if toggled in, make sure to update the current line member in the lines map so that
        // we can know to untune if user selects another line

        setRealTimeRoomMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          // TODO: update the relevant lineMember (based on which userId is given): state and last visit date if current user is joining

          if (newMap[res.lineId]) newMap[res.lineId].tunedInMemberIds = res.allTunedIntoUserIds;

          return newMap;
        });
      },
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STARTED_BROADCASTING,
      (res: UserStartedBroadcastingResponse) => {
        console.log('someone is starting to broadcast');

        setRealTimeRoomMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          if (newMap[res.lineId])
            newMap[res.lineId].currentBroadcastersUserIds = [
              ...(newMap[res.lineId].currentBroadcastersUserIds ?? []),
              res.userId,
            ];

          return newMap;
        });
      },
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STOPPED_BROADCASTING,
      (res: UserStoppedBroadcastingResponse) => {
        setRealTimeRoomMap((prevLinesMap) => {
          const newMap = { ...prevLinesMap };

          if (newMap[res.lineId]?.currentBroadcastersUserIds) {
            newMap[res.lineId].currentBroadcastersUserIds = newMap[
              res.lineId
            ].currentBroadcastersUserIds.filter(
              (broadcasterUserId) => broadcasterUserId !== res.userId,
            );
          }

          return newMap;
        });
      },
    );

    return () => {
      // ?perhaps only remove specific ones?
      $ws.removeAllListeners();
    };
  }, [realTimeRoomMap, $ws]);

  // converts the initial rooms to a map
  useEffect(() => {
    if (rooms.value?.data?.masterLines?.length > 0) {
      setRealTimeRoomMap((prevMappings) => {
        // go through the lines from the persistent store

        // get all of the id's and map assign to the main object

        // ?prolly have no previous at this point...but I'm okay with override since this
        // ?useeffect is triggered on the refetching of the persistent store so we
        // ?are prolly looking to do a full app refresh and connection refresh
        const newMap = { ...prevMappings };

        rooms.value.data.masterLines.forEach((masterLine) => {
          const lineId = masterLine.lineDetails._id.toString();
          newMap[lineId] = masterLine;
        });

        return newMap;
      });
    }
  }, [rooms.value, setRealTimeRoomMap]);

  return (
    <RealTimeRoomContext.Provider value={{ roomsMap: realTimeRoomMap }}>
      {' '}
    </RealTimeRoomContext.Provider>
  );
}

export default function useRealTimeRooms() {
  return useContext(RealTimeRoomContext);
}
