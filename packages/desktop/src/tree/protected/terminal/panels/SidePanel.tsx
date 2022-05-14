import { LineMemberState } from '@nirvana/core/models/line.model';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import { Avatar, Skeleton, Tooltip } from 'antd';
import React, { useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiActivity, FiSun } from 'react-icons/fi';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';
import useRooms from '../../../../providers/RoomsProvider';
import useAuth from '../../../../providers/AuthProvider';
import LineIcon from '../../../../components/lineIcon';
import moment from 'moment';

export default function SidePanel() {
  // using merely for loading state...better to add to realtimeroom context?
  const { rooms: initialRoomsFetch } = useRooms();

  const { roomsMap, handleSelectLine, selectedLineId } = useRealTimeRooms();

  const [toggleTunedLines, allLines] = useMemo(() => {
    const masterLines: MasterLineData[] = Object.values(roomsMap);

    const tunedLines: MasterLineData[] = [];
    const restLines: MasterLineData[] = [];

    masterLines.forEach((masterLine) => {
      if (masterLine.currentUserMember.state === LineMemberState.TUNED) restLines.push(masterLine);
      else restLines.push(masterLine);
    });

    return [tunedLines, restLines];
  }, [roomsMap]);

  return (
    <div className="flex flex-col bg-white w-[400px] relative group">
      {/* tuned in lines block */}
      <div className="bg-gray-100 flex flex-col shadow-lg">
        {/* tuned in header + general controls */}

        <Tooltip placement="right" title={'These are your active rooms...'}>
          <div className="flex flex-row items-center py-3 px-4 pb-0">
            <span className="flex flex-row gap-2 items-center justify-start text-gray-400 animate-pulse">
              <FiActivity className="text-sm" />

              <h2 className="text-inherit text-sm">Rooms</h2>

              <p className="text-slate-300 text-xs">{`${toggleTunedLines?.length || 0}/3`}</p>
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
        className="absolute bottom-3 right-3 z-10 scale-0 
    group-hover:scale-100 ease-in-out hover:transition group-hover:transition delay-100 duration-200"
      >
        <button
          className="flex flex-row gap-2 items-center justify-evenly 
      shadow-xl bg-gray-800 p-2 text-white text-xs"
        >
          <FaPlus />
          <span>New line</span>
        </button>
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
  console.warn('re-rendering', line.lineDetails._id.toString());

  const { user } = useAuth();

  const isUserTunedIn = useMemo(
    () => line.tunedInMemberIds?.includes(user._id.toString()),
    [line.tunedInMemberIds, user],
  );

  /**
   * TODO: slowly add to this and fix based on added features
   * */
  const renderActivityIcon = useMemo(() => {
    // if there is someone or me broadcasting here
    if (line.currentBroadcastersUserIds?.length > 0)
      return <FiSun className="text-teal-500 animate-pulse" />;

    if (isUserTunedIn) return <FiActivity className="text-black animate-pulse" />;

    // if there is new activity blocks for me
    if (line.currentUserMember.lastVisitDate)
      return <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>;

    return <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>;
  }, [line, isUserTunedIn]);

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
      className={`flex flex-row items-center justify-start gap-2 p-2 px-4 h-14 hover:bg-gray-200 cursor-pointer transition-all
last:border-b-0 border-b border-b-gray-200 relative z-50 rounded ${
        isSelected && 'bg-gray-200 scale-110 shadow-2xl translate-x-3'
      }`}
    >
      {/* status dot */}
      <div className="flex-shrink-0 h-4 w-4">{renderActivityIcon}</div>

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
