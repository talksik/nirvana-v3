import React, { useEffect, useState, useContext, useCallback } from 'react';
import useRooms from './RoomsProvider';
import useSockets from './SocketProvider';

import MasterLineData from '@nirvana/core/models/masterLineData.model';

import {
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneDisconnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  TuneToLineRequest,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
  ConnectToLineRequest,
  UntuneFromLineRequest,
} from '@nirvana/core/sockets/channels';
import toast from 'react-hot-toast';
import { useImmer } from 'use-immer';
import { LineMemberState } from '@nirvana/core/models/line.model';
import { useAsyncFn, useKeyPressEvent } from 'react-use';

import { updateLineMemberState } from '../api/NirvanaApi';
import UpdateLineMemberState from '@nirvana/core/requests/updateLineMemberState.request';
import useAuth from './AuthProvider';
import { User } from '@nirvana/core/models/user.model';
import SidePanel from '../tree/protected/terminal/panels/SidePanel';
import MainPanel from '../tree/protected/terminal/panels/MainPanel';
import useElectron from './ElectronProvider';

type LineIdToMasterLine = {
  [lineId: string]: MasterLineData;
};

// TODO: implement the below to save renders
type TunedMembersMap = {
  [lineId: string]: string[];
};

type ConnectedMembesMap = {
  [lineId: string]: string[];
};

type UserMap = {
  [userId: string]: User;
};

type BroadcastersMap = {
  [lineId: string]: string[];
};

interface ITerminalProvider {
  roomsMap: LineIdToMasterLine;

  selectedLineId?: string;
  handleSelectLine?: (newLineId: string) => void;

  handleUpdateLineMemberState?: (lineId: string, newState: LineMemberState) => void;

  showNewChannelForm: boolean;
  handleShowNewChannelForm?: (showOrHide: 'show' | 'hide') => void;
}

const TerminalContext = React.createContext<ITerminalProvider>({
  roomsMap: {},

  showNewChannelForm: false,
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

// TODO: many of this can be done in a HOC like <Terminal /> but it doesn't matter, they both just
// re-render, just make sure to pass in lighter props to children like main panel or lineRow
export function TerminalProvider({ children }: { children: React.ReactChild }) {
  const { rooms } = useRooms();
  const { user } = useAuth();
  const { $ws } = useSockets();
  const [roomMap, updateRoomMap] = useImmer<LineIdToMasterLine>({});

  const { desktopMode } = useElectron();

  const [selectedLineId, setSelectedLineId] = useState<string>();

  const [moveLineState, moveLine] = useAsyncFn(updateLineMemberState);
  const [showNewChannelForm, setShowNewChannelForm] = useState<boolean>(false);

  /** All line listeners */
  useEffect(() => {
    // when me or anyone just initially connects to line
    $ws.on(ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE, (res: SomeoneConnectedResponse) => {
      console.log(`${res.userId} connected to room ${res.lineId}`);

      updateRoomMap((draft) => {
        if (!draft[res.lineId]) {
          toast.error('there was a problem updating rooms!!!');
          return;
        }

        draft[res.lineId].connectedMemberIds = res.allUsers;
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

        draft[res.lineId].tunedInMemberIds = res.allUsers;
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
      // !this will remove all listeners across the app and we want it to?
      $ws.removeAllListeners();
    };
  }, [$ws, updateRoomMap]);

  const handleConnectToLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.CONNECT_TO_LINE, new ConnectToLineRequest(lineId));
    },
    [$ws],
  );

  const handleTuneIntoLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.TUNE_INTO_LINE, new TuneToLineRequest(lineId));
    },
    [$ws],
  );

  const handleUntuneFromLine = useCallback(
    (lineId: string) => {
      $ws.emit(ServerRequestChannels.UNTUNE_FROM_LINE, new UntuneFromLineRequest(lineId));
    },
    [$ws],
  );

  // converts the initial rooms fetch to a map
  useEffect(() => {
    if (rooms.value?.data?.masterLines?.length > 0) {
      updateRoomMap((draft) => {
        rooms.value.data.masterLines.forEach((masterLine) => {
          const lineId = masterLine.lineDetails._id.toString();
          draft[lineId] = masterLine;

          handleConnectToLine(lineId);
          if (masterLine.currentUserMember.state === LineMemberState.TUNED) {
            handleTuneIntoLine(lineId);
          }
        });
      });
    }
  }, [rooms.value, updateRoomMap, handleConnectToLine, handleTuneIntoLine]);

  // persist whether I want it toggle tuned or not
  const handleUpdateLineMemberState = useCallback(
    (lineId: string, newState: LineMemberState) => {
      moveLine(new UpdateLineMemberState(newState), lineId)
        .then((_res) => {
          updateRoomMap((draft) => {
            draft[lineId].currentUserMember.state = newState;
          });
        })
        .catch((error) => {
          toast.error('problem in updating line member state');
          console.error(error);
        });
    },
    [moveLine, updateRoomMap],
  );

  /**
   * selection globally
   * tune into socket room and tell everyone else
   */
  const handleSelectLine = useCallback(
    (newLineIdToSelect: string) => {
      setSelectedLineId((prevLineId) => {
        if (newLineIdToSelect === prevLineId) {
          return prevLineId;
        }

        // untune from the last line if it was just a temporary tuned one
        if (roomMap[prevLineId]?.currentUserMember.state === LineMemberState.INBOX) {
          handleUntuneFromLine(prevLineId);
        }

        // tune in if not already tuned into this line
        if (!roomMap[newLineIdToSelect].tunedInMemberIds?.includes(user._id.toString())) {
          handleTuneIntoLine(newLineIdToSelect);
        }

        return newLineIdToSelect;
      });

      setShowNewChannelForm(false);
    },
    [
      setSelectedLineId,
      handleUntuneFromLine,
      roomMap,
      user,
      handleTuneIntoLine,
      setShowNewChannelForm,
    ],
  );

  const handleShowNewChannelForm = useCallback(
    (showOrHide: 'show' | 'hide' = 'show') => {
      setSelectedLineId(undefined);
      setShowNewChannelForm(showOrHide === 'show');
    },
    [setShowNewChannelForm, setSelectedLineId],
  );

  // handle shortcuts
  const clearMind = useCallback(() => {
    setSelectedLineId(undefined);
    setShowNewChannelForm(false);
  }, [setSelectedLineId, setShowNewChannelForm]);

  useKeyPressEvent('Escape', clearMind);

  return (
    <TerminalContext.Provider
      value={{
        roomsMap: roomMap,
        handleSelectLine,
        selectedLineId,
        handleUpdateLineMemberState,
        showNewChannelForm,
        handleShowNewChannelForm,
      }}
    >
      <div className="flex flex-row flex-1 h-full w-full">
        <SidePanel />

        {desktopMode === 'mainApp' && <MainPanel />}
      </div>

      {children}
    </TerminalContext.Provider>
  );
}

export default function useTerminalProvider() {
  return useContext(TerminalContext);
}
