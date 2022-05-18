import { LineMemberState } from '@nirvana/core/models/line.model';
import { Skeleton, Tooltip } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { FiActivity, FiPlus, FiSearch } from 'react-icons/fi';
import useRooms from '../../../../providers/RoomsProvider';
import NavBar from '../navbar/Navbar';
import NoTextLogo from '@nirvana/components/logo/NoTextLogo';
import LineRow from '../line/LineRow';
import useTerminalProvider from '../../../../providers/TerminalProvider';

export default function SidePanel() {
  // using merely for loading state...better to add to realtimeroom context?
  const { rooms: initialRoomsFetch } = useRooms();

  const { roomsMap, handleSelectLine, selectedLineId, handleShowNewChannelForm } =
    useTerminalProvider();

  // todo: sort
  const allChannels = useMemo(() => {
    const channels = Object.values(roomsMap);

    channels.sort((channelA, channelB) => {
      if (
        channelA.currentUserMember.state === LineMemberState.TUNED &&
        channelB.currentUserMember.state === LineMemberState.INBOX
      )
        return -1;

      if (
        channelB.currentUserMember.state === LineMemberState.TUNED &&
        channelA.currentUserMember.state === LineMemberState.INBOX
      )
        return 1;

      if (channelA.lineDetails.createdDate > channelB.lineDetails.createdDate) return 1;

      // sort also by activity

      return -1;
    });

    return channels;
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

      {/* tuned in header + general controls */}
      <div className="flex flex-col shadow-xl bg-gray-100 pb-2">
        <Tooltip placement="right" title={'These are your active rooms...'}>
          <div className="flex flex-row items-center py-3 px-4 pb-0">
            <span className="flex flex-row gap-2 items-center justify-start text-gray-400 animate-pulse">
              <FiActivity className="text-sm" />

              <h2 className="text-inherit text-xs">Tuned In</h2>

              <p className="text-slate-300 text-xs ml-auto">{`${allChannels?.length || 0}/3`}</p>
            </span>
          </div>
        </Tooltip>
      </div>

      {!(allChannels.length > 0) && (
        <span className="text-gray-300 text-sm my-5 text-center">
          You have no lines! <br /> Create one to connect to your team instantly.
        </span>
      )}

      {/* rest of the lines */}
      <div className={'flex flex-col'}>
        {initialRoomsFetch.loading ? (
          <Skeleton />
        ) : (
          allChannels.map((masterLineData, index) => (
            <LineRow
              index={index}
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
