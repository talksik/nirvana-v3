import { LineMemberState } from '@nirvana/core/models/line.model';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { Avatar, Skeleton, Tooltip } from 'antd';
import React, { useCallback, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { FiActivity, FiSearch, FiSun } from 'react-icons/fi';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';
import useRooms from '../../../../providers/RoomsProvider';
import useAuth from '../../../../providers/AuthProvider';
import LineIcon from '../../../../components/lineIcon';
import moment from 'moment';
import NavBar from '../navbar/Navbar';
import NoTextLogo from '@nirvana/components/logo/NoTextLogo';

export default function SidePanel() {
  // using merely for loading state...better to add to realtimeroom context?
  const { rooms: initialRoomsFetch } = useRooms();

  const { roomsMap, handleSelectLine, selectedLineId } = useRealTimeRooms();

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

  return (
    <div className="flex flex-col w-[350px] relative group shadow-xl bg-white">
      <NavBar />

      <div className="px-4 flex flex-row items-center gap-2">
        <div className="flex flex-row items-center space-x-2 bg-gray-100 p-2 rounded flex-1">
          <FiSearch className="text-xs text-gray-300" />
          <input
            placeholder="Search for people, channels, clips..."
            className="flex-1 bg-transparent placeholder-gray-300 placeholder:text-xs focus:outline-none"
            onChange={() => {
              //
            }}
            value={''}
          />
        </div>

        <button
          className="flex flex-row gap-2 items-center justify-evenly 
      shadow-xl bg-gray-800 p-2 text-white text-xs"
        >
          <FaPlus />
        </button>
      </div>

      {/* tuned in lines block */}
      <div className="flex flex-col border-b border-b-gray-100 mt-5">
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
      <div className={'flex flex-col mt-5'}>
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
        onKeyDown={() => {
          //
        }}
        onClick={() => {
          console.log('opening main app');
        }}
        role="presentation"
        className="absolute bottom-5 left-5"
      >
        <NoTextLogo type="small" />
      </div>
    </div>
  );
}

const LineRow = React.memo(LineRowTest);

function LineRowTest({
  line,
  handleSelectLine,
  isSelected,
}: {
  line: MasterLineData;
  handleSelectLine: (newLineId: string) => void;
  isSelected: boolean;
}) {
  const { user } = useAuth();

  const isUserTunedIn = useMemo(
    () => line.tunedInMemberIds?.includes(user._id.toString()),
    [line.tunedInMemberIds, user],
  );

  const renderRightActivity = useMemo(() => {
    // TODO: get the profile pictures of the broadcasters
    if (line.currentBroadcastersUserIds?.length > 0)
      return (
        <Avatar.Group
          key={`lineRowRightActivityGroup-${line.lineDetails._id.toString()}`}
          maxCount={2}
          maxPopoverTrigger="click"
          size="small"
          maxStyle={{
            color: '#f56a00',
            backgroundColor: '#fde3cf',
            cursor: 'pointer',
            borderRadius: '0',
          }}
          className="shadow-lg"
        >
          {line.otherUserObjects?.map((otherUser, index) => (
            <Avatar
              key={`lineListActivitySection-${otherUser._id.toString()}-${index}`}
              src={otherUser.picture ?? ''}
              shape="square"
              size={'small'}
            />
          ))}
        </Avatar.Group>
      );

    // if there is someone or me broadcasting here
    if (line.currentBroadcastersUserIds?.length > 0)
      return <FiSun className="text-teal-500 animate-pulse" />;

    if (isUserTunedIn) return <FiActivity className="text-black animate-pulse" />;

    // if there is new activity blocks for me
    if (line.currentUserMember.lastVisitDate)
      return <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>;

    // if there is new activity/black dot, then show relative time as little bolder? or too much?

    // TODO: compare last visit date to latest audio block
    if (line.currentUserMember)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {moment(line.currentUserMember.lastVisitDate).fromNow(true)}
        </span>
      );

    return (
      <span className={`text-gray-300 ml-auto text-xs `}>
        {moment(line.currentUserMember.lastVisitDate).fromNow(true)}
      </span>
    );
  }, [line]);

  const profilePictures = useMemo(() => {
    const pictureSources: string[] = [];

    // ?don't add in my image as that's useless contextually?
    // if (userData?.user?.picture) pictureSources.push(userData.user.picture);

    line.otherUserObjects?.forEach((otherUser) => {
      if (otherUser.picture) pictureSources.push(otherUser.picture);
    });

    return pictureSources;
  }, [line, user]);

  return (
    <div
      onClick={() => handleSelectLine(line.lineDetails._id.toString())}
      role={'presentation'}
      className={`flex flex-row items-center justify-start gap-2 px-4 py-4 hover:bg-gray-200 
      cursor-pointer transition-all relative z-50 rounded ${
        isSelected && 'bg-gray-200 scale-110 shadow-2xl translate-x-2'
      }`}
    >
      {/* status dot */}
      {profilePictures && <LineIcon grayscale={!isUserTunedIn} sourceImages={profilePictures} />}

      <h2
        className={`text-inherit text-md max-w-[220px] truncate text-slate-800 ${
          line.currentUserMember.lastVisitDate ? 'font-semibold' : ''
        }`}
      >
        {line.lineDetails.name || line.otherUserObjects[0].givenName}
      </h2>

      <div className="ml-auto flex-shrink-0">{renderRightActivity}</div>
    </div>
  );
}
