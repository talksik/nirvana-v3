import { LineMemberState } from '@nirvana/core/models/line.model';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { Avatar, Skeleton, Tooltip } from 'antd';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { FiActivity, FiPlus, FiSearch, FiSun, FiX } from 'react-icons/fi';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';
import useRooms from '../../../../providers/RoomsProvider';
import useAuth from '../../../../providers/AuthProvider';
import LineIcon from '../../../../components/lineIcon';
import moment from 'moment';
import NavBar from '../navbar/Navbar';
import NoTextLogo from '@nirvana/components/logo/NoTextLogo';
import LineRow from '../line/LineRow';

export default function SidePanel() {
  // using merely for loading state...better to add to realtimeroom context?
  const { rooms: initialRoomsFetch } = useRooms();

  const { roomsMap, handleSelectLine, selectedLineId, handleShowNewChannelForm } =
    useRealTimeRooms();

  const [toggleTunedLines, allLines] = useMemo(() => {
    const masterLines: MasterLineData[] = Object.values(roomsMap);

    const tunedLines: MasterLineData[] = [];
    const restLines: MasterLineData[] = [];

    masterLines.forEach((masterLine) => {
      if (masterLine.currentUserMember.state === LineMemberState.TUNED) tunedLines.push(masterLine);
      else restLines.push(masterLine);
    });

    return [tunedLines, restLines];
  }, [roomsMap]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCreateNewChannel = useCallback(() => {
    handleShowNewChannelForm('show');
  }, [handleShowNewChannelForm]);

  return (
    <div className="flex flex-col w-[350px] relative group border-r border-r-gray-200 shadow-xl bg-white z-20">
      <NavBar />

      <div className="flex flex-row p-4 items-center bg-gray-100 gap-2">
        <div className="flex-1 flex flex-row items-center space-x-2 bg-gray-200 p-2 rounded">
          <FiSearch className="text-xs text-gray-400" />
          <input
            placeholder="Search for people, channels, clips..."
            className="flex-1 bg-transparent placeholder-gray-400 text-gray-500 placeholder:text-xs focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>

        <Tooltip title={'New channel'}>
          <button
            onClick={handleCreateNewChannel}
            className="ml-auto flex flex-row items-center justify-evenly 
      shadow-xl bg-gray-800 p-2 text-white text-xs"
          >
            <FiPlus />
          </button>
        </Tooltip>
      </div>

      {/* tuned in lines block */}
      <div className="flex flex-col shadow-xl bg-gray-100">
        {/* tuned in header + general controls */}

        <Tooltip placement="right" title={'These are your active rooms...'}>
          <div className="flex flex-row items-center py-3 px-4 pb-0">
            <span className="flex flex-row gap-2 items-center justify-start text-gray-400 animate-pulse">
              <FiActivity className="text-sm" />

              <h2 className="text-inherit text-xs">Tuned In</h2>

              <p className="text-slate-300 text-xs ml-auto">{`${
                toggleTunedLines?.length || 0
              }/3`}</p>
            </span>
          </div>
        </Tooltip>

        {/* list of toggle tuned lines */}
        <div className="flex flex-col mt-2">
          {toggleTunedLines.map((masterLineData) => (
            <LineRow
              key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
              line={masterLineData}
              handleSelectLine={handleSelectLine}
              isSelected={masterLineData.lineDetails._id.toString() === selectedLineId}
            />
          ))}
        </div>
      </div>

      {!(allLines.length > 0) && !(toggleTunedLines.length > 0) && (
        <span className="text-gray-300 text-sm my-5 text-center">
          You have no lines! <br /> Create one to connect to your team instantly.
        </span>
      )}

      {/* rest of the lines */}
      <div className={'flex flex-col'}>
        {initialRoomsFetch.loading ? (
          <Skeleton />
        ) : (
          allLines.map((masterLineData) => (
            <LineRow
              key={`terminalListLines-${masterLineData.lineDetails._id.toString()}`}
              line={masterLineData}
              handleSelectLine={handleSelectLine}
              isSelected={masterLineData.lineDetails._id.toString() === selectedLineId}
            />
          ))
        )}
      </div>

      <div
        className="absolute bottom-4 left-4"
        onKeyDown={() => {
          //
        }}
        onClick={() => {
          console.log('opening main app');
        }}
        role="presentation"
      >
        <NoTextLogo type="small" />
      </div>
    </div>
  );
}
