import React, { useCallback, useState } from 'react';
import useRealTimeRooms from '../../../providers/RealTimeRoomProvider';
import useElectron from '../../../providers/ElectronProvider';
import useAuth from '../../../providers/AuthProvider';
import NavBar from './navbar/Navbar';
import MasterLineData from '@nirvana/core/models/masterLineData.model';

import useRooms from '../../../providers/RoomsProvider';
import toast from 'react-hot-toast';
import SidePanel from './panels/SidePanel';

export default function Terminal() {
  const { roomsMap } = useRealTimeRooms();
  const { desktopMode } = useElectron();

  return (
    <div className="flex flex-col flex-1">
      <NavBar />

      <SidePanel />

      {/* <MainPanel /> */}
    </div>
  );
}
