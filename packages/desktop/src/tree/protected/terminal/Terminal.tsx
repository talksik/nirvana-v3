import React, { useCallback, useState } from 'react';
import useRealTimeRooms from '../../../providers/RealTimeRoomProvider';
import useElectron from '../../../providers/ElectronProvider';
import useAuth from '../../../providers/AuthProvider';
import NavBar from './navbar/Navbar';
import MasterLineData from '@nirvana/core/models/masterLineData.model';

import useRooms from '../../../providers/RoomsProvider';
import toast from 'react-hot-toast';

export default function Terminal() {
  const { rooms: initialRoomsState } = useRooms();
  const { roomsMap } = useRealTimeRooms();
  const { desktopMode } = useElectron();

  const { user } = useAuth();

  const [selectedLine, setSelectedLine] = useState<MasterLineData>();

  /** show user line details on click of one line */
  const handleSelectLine = useCallback(
    (newLineIdToSelect: string) => {
      toast('selecting line!! NOT IMPLEMENTED');
      setSelectedLine(roomsMap[newLineIdToSelect]);
    },
    [setSelectedLine],
  );

  return (
    <div className="flex flex-col flex-1">
      <NavBar />
    </div>
  );
}

// have a socket view component to just connect on mount and disconnect from specific | tunes in and untunes similarly
// have a socket view component to just tune into tuned in lines
// have a stream view component to just make peer connections and have stream components available
