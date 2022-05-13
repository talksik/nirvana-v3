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
    },
    [setSelectedLine],
  );

  return (
    <div className="flex flex-col flex-1">
      <NavBar />
    </div>
  );
}
