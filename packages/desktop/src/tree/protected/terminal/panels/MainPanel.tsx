import React from 'react';
import useAuth from '../../../../providers/AuthProvider';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';

export default function MainPanel() {
  const { user } = useAuth();

  const { roomsMap } = useRealTimeRooms();

  return (
    <div
      className="flex flex-col flex-1 justify-center items-center bg-gray-100 
border-l border-l-gray-200"
    >
      <span className="text-xl text-gray-800">{`Hi ${user.givenName}!`}</span>
      <span className="text-md text-gray-400">{"You're all set!"}</span>
    </div>
  );
}
