import { LineMemberState } from '@nirvana/core/models/line.model';
import { Avatar, Dropdown, Skeleton, Tooltip } from 'antd';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FiActivity, FiPlus, FiSearch } from 'react-icons/fi';
import useRooms from '../../../../providers/RoomsProvider';
import NavBar from '../navbar/Navbar';
import NoTextLogo from '@nirvana/components/logo/NoTextLogo';
import LineRow from '../line/LineRow';
import useTerminalProvider from '../../../../providers/TerminalProvider';
import useAuth from '../../../../providers/AuthProvider';
import useSockets from '../../../../providers/SocketProvider';
import useElectron from '../../../../providers/ElectronProvider';
import useStreams from '../../../../providers/StreamProvider';
import { maxToggleTunedChannelCount } from '../rules';

export default function SidePanel() {
  // using merely for loading state...better to add to realtimeroom context?
  const { rooms: initialRoomsFetch } = useRooms();

  const { user, handleLogout } = useAuth();

  const {
    allChannels,
    tunedChannelsCount,
    handleSelectLine,
    selectedLineId,
    handleShowNewChannelForm,
  } = useTerminalProvider();

  const { handleFlowState } = useSockets();

  const { handleToggleDesktopMode, desktopMode, isWindowFocused } = useElectron();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCreateNewChannel = useCallback(() => {
    handleShowNewChannelForm('show');
  }, [handleShowNewChannelForm]);

  return (
    <div
      className={`flex flex-col w-[350px] group 
    border-r border-r-gray-200 shadow-xl z-20 bg-white
    
    ${!isWindowFocused && desktopMode === 'overlayOnly' && ' opacity-20 '}`}
    >
      {/* user control panel */}
      <div
        className={`bg-gray-100 flex flex-row items-center gap-2
       p-4 pb-2 z-50 w-full titlebar ${
         desktopMode === 'overlayOnly' && 'border-b border-b-gray-200'
       } 
      `}
      >
        <button onClick={handleToggleDesktopMode} className={'mr-auto animate-pulse'}>
          <NoTextLogo type="small" />
        </button>

        {desktopMode === 'mainApp' && (
          <span className="text-gray-800 font-semibold mx-auto">Channels</span>
        )}

        <button
          onClick={handleLogout}
          className="text-gray-300 text-xs px-3 py-2 transition-all hover:bg-gray-200"
        >
          log out
        </button>

        <button
          onClick={handleFlowState}
          className="text-gray-300 text-xs px-3 py-2 transition-all hover:bg-gray-200"
        >
          flow
        </button>

        <UserProfileAvatar />
      </div>

      {/* search + other stuff  */}
      {desktopMode === 'mainApp' && (
        <>
          <div className="flex flex-row p-4 items-center bg-gray-100 gap-2">
            <div className="flex-1 flex flex-row items-center space-x-2 bg-gray-200 p-2 rounded">
              <FiSearch className="text-xs text-gray-400" />
              <input
                placeholder="Search or start a conversation"
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

          <div className="flex flex-col shadow-xl bg-gray-100 pb-2">
            <Tooltip placement="right" title={'These are your active rooms...'}>
              <div className="flex flex-row items-center py-3 px-4 pb-0">
                <span className="flex flex-row gap-2 items-center justify-start text-gray-400 animate-pulse">
                  <FiActivity className="text-sm" />

                  <h2 className="text-inherit text-xs">Tuned In</h2>

                  <p className="text-slate-300 text-xs ml-auto">{`${
                    tunedChannelsCount || 0
                  }/${maxToggleTunedChannelCount}`}</p>
                </span>
              </div>
            </Tooltip>
          </div>
        </>
      )}

      {!(allChannels.length > 0) && (
        <span className="text-gray-300 text-sm my-5 text-center">
          You have no lines! <br /> Create one to connect to your team instantly.
        </span>
      )}

      {/* rest of the lines */}
      <div className={'flex-1 overflow-y-auto flipped'}>
        <div className="flex flex-col direction-ltr">
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
      </div>
    </div>
  );
}

// todo if audio only mode, show avatar
// if problem, show error
function UserProfileAvatar() {
  const { user } = useAuth();
  const { userLocalStream } = useStreams();

  const videoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    if (videoRef.current && userLocalStream) videoRef.current.srcObject = userLocalStream;
  }, [userLocalStream]);

  if (userLocalStream) return <video ref={videoRef} muted height={'50'} width={'50'} autoPlay />;

  return (
    <>
      {user.picture && (
        <Avatar
          key={`userHeaderProfilePicture`}
          className="shadow-md hover:scale-110 transition-all"
          size={'default'}
          alt={user.name}
          src={user.picture}
          shape="square"
        />
      )}
    </>
  );
}
