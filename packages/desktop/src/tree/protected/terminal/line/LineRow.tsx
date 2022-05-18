import MasterLineData from '@nirvana/core/models/masterLineData.model';
import React, { useMemo, useState } from 'react';

import { Avatar, Skeleton, Tooltip } from 'antd';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { FiActivity, FiPlus, FiSearch, FiSun, FiX } from 'react-icons/fi';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';
import useRooms from '../../../../providers/RoomsProvider';
import useAuth from '../../../../providers/AuthProvider';
import LineIcon from '../../../../components/lineIcon';
import moment from 'moment';

export default React.memo(function LineRow({
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
    if (isSelected) {
      return (
        <Tooltip title={'esc'}>
          <span className="ml-5 flex flex-col items-center gap-2 cursor-pointer">
            <FiX className="text-gray-300 text-xl" />
          </span>
        </Tooltip>
      );
    }
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
  }, [line, isSelected]);

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
        isSelected && 'bg-gray-200 scale-110 shadow-2xl translate-x-3'
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
});
