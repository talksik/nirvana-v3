import React, { useEffect, useState, useContext, useCallback } from 'react';
import useRooms from './RoomsProvider';
import useSockets from './SocketProvider';

import MasterLineData from '@nirvana/core/models/masterLineData.model';

import {
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneDisconnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
} from '@nirvana/core/sockets/channels';
import toast from 'react-hot-toast';
import { useImmer } from 'use-immer';

type LineIdToMasterLine = {
  [lineId: string]: MasterLineData;
};

interface IRealTimeRoomProvider {
  roomsMap: LineIdToMasterLine;

  selectedLineId?: string;
  handleSelectLine: (newLineId: string) => void;
}

const RealTimeRoomContext = React.createContext<IRealTimeRoomProvider>({
  roomsMap: {},
  handleSelectLine: () => {
    //
  },
});

/**
 *
 * handles reads of new data
 * keeps listening to incoming socket events to make sure that the realtime rooms map is highly available
 *
 * on load, we want to grab all of the rooms we are in
 * put them in a map
 *
 * fetch more audio clips, fire off async function to fetch more and add to the room map
 *
 * Socket Rooms:
 * - all people online for a line
 * - all tuned in folks on a line...have it selected or toggle tuned
 *
 * Socket Events:
 * - someone connected
 * - someone tuned in
 * - someone started broadcasting
 * - someone stopped broadcasting
 *
 * - someone disconnected...take them out of the necessary lists
 * - someone left x room
 * - someone joined x room
 *
 * - someone added me to line
 *
 * - someone went into flow state their status
 *
 * Socket Emissions:
 * - join a line
 * - tune into a line
 * - send audio clip
 * - create a line -> send to specific people
 *
 * REST endpoints:
 * - toggle tune or untoggle tune
 * - fetch content blocks for line history - react query
 */

export function RealTimeRoomProvider({ children }: { children: React.ReactChild }) {
  const { rooms } = useRooms();
  const { $ws } = useSockets();
  const [roomMap, updateRoomMap] = useImmer<LineIdToMasterLine>({});

  const [selectedLineId, setSelectedLineId] = useState<string>();

  useEffect(() => {
    // when me or anyone just initially connects to line
    $ws.on(ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE, (res: SomeoneConnectedResponse) => {
      console.log(`${res.userId} connected to room ${res.lineId}`);

      updateRoomMap((draft) => {
        if (!draft[res.lineId]) {
          toast.error('there was a problem updating rooms!!!');
          return;
        }

        if (draft[res.lineId].connectedMemberIds) {
          draft[res.lineId].connectedMemberIds.push(res.userId);
        } else {
          draft[res.lineId].connectedMemberIds = [res.userId];
        }
      });
    });

    // someone tuning in, including perhaps me | either toggled in or just temporary
    $ws.on(ServerResponseChannels.SOMEONE_TUNED_INTO_LINE, (res: SomeoneTunedResponse) => {
      console.log(`${res.userId} tuned into line ${res.lineId}`);

      updateRoomMap((draft) => {
        if (!draft[res.lineId]) {
          toast.error('there was a problem updating rooms!!!');
          return;
        }

        if (draft[res.lineId].tunedInMemberIds) {
          draft[res.lineId].tunedInMemberIds.push(res.userId);
        } else {
          draft[res.lineId].tunedInMemberIds = [res.userId];
        }
      });
    });

    $ws.on(
      ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
      (res: SomeoneUntunedFromLineResponse) => {
        console.log(`${res.userId} untuned from ${res.lineId}`);

        updateRoomMap((draft) => {
          if (!draft[res.lineId]) {
            toast.error('there was a problem updating rooms!!!');
            return;
          }

          if (draft[res.lineId].tunedInMemberIds) {
            draft[res.lineId].tunedInMemberIds = draft[res.lineId].tunedInMemberIds.filter(
              (userId) => userId !== res.userId,
            );
          }
        });
      },
    );

    // remove them from the line connected list and tuned list if they are there
    $ws.on(
      ServerResponseChannels.SOMEONE_DISCONNECTED_FROM_LINE,
      (res: SomeoneDisconnectedResponse) => {
        updateRoomMap((draft) => {
          if (!draft[res.lineId]) {
            toast.error('there was a problem updating rooms!!!');
            return;
          }

          draft[res.lineId].connectedMemberIds = draft[res.lineId].connectedMemberIds?.filter(
            (userId) => userId !== res.userId,
          );
          draft[res.lineId].tunedInMemberIds = draft[res.lineId].tunedInMemberIds?.filter(
            (userId) => userId !== res.userId,
          );
        });
      },
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STARTED_BROADCASTING,
      (res: UserStartedBroadcastingResponse) => {
        console.log(`${res.userId} is starting to broadcast in ${res.lineId}`);

        updateRoomMap((draft) => {
          if (!draft[res.lineId]) {
            toast.error('there was a problem updating rooms!!!');
            return;
          }

          if (draft[res.lineId].currentBroadcastersUserIds) {
            draft[res.lineId].currentBroadcastersUserIds.push(res.userId);
          } else {
            draft[res.lineId].currentBroadcastersUserIds = [res.userId];
          }
        });
      },
    );

    $ws.on(
      ServerResponseChannels.SOMEONE_STOPPED_BROADCASTING,
      (res: UserStoppedBroadcastingResponse) => {
        console.log(`${res.userId} is STOPPED BROADCASTING in ${res.lineId}`);

        updateRoomMap((draft) => {
          if (!draft[res.lineId]) {
            toast.error('there was a problem updating rooms!!!');
            return;
          }

          if (draft[res.lineId].currentBroadcastersUserIds) {
            draft[res.lineId].currentBroadcastersUserIds = draft[
              res.lineId
            ].currentBroadcastersUserIds.filter((userId) => userId !== res.userId);
          }
        });
      },
    );

    return () => {
      // ?perhaps only remove specific ones?
      $ws.removeAllListeners();
    };
  }, [roomMap, $ws, updateRoomMap]);

  // converts the initial rooms fetch to a map
  useEffect(() => {
    if (rooms.value?.data?.masterLines?.length > 0) {
      updateRoomMap((draft) => {
        rooms.value.data.masterLines.forEach((masterLine) => {
          const lineId = masterLine.lineDetails._id.toString();
          draft[lineId] = masterLine;
        });
      });
    }
  }, [rooms.value, updateRoomMap]);

  /** show user line details on click of one line */
  const handleSelectLine = useCallback(
    (newLineIdToSelect: string) => {
      toast('selecting line!! NOT IMPLEMENTED');
      setSelectedLineId(newLineIdToSelect);
    },
    [setSelectedLineId],
  );

  console.warn(roomMap);

  return (
    <RealTimeRoomContext.Provider value={{ roomsMap: roomMap, handleSelectLine, selectedLineId }}>
      {children}
    </RealTimeRoomContext.Provider>
  );
}

export default function useRealTimeRooms() {
  return useContext(RealTimeRoomContext);
}
