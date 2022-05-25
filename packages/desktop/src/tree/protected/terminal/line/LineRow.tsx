import MasterLineData from '@nirvana/core/models/masterLineData.model';
import React, { useMemo, useCallback } from 'react';

import { Avatar, Tooltip } from 'antd';
import { FiSun, FiX } from 'react-icons/fi';
import useAuth from '../../../../providers/AuthProvider';
import LineIcon from '../../../../components/lineIcon';
import moment from 'moment';
import { useKeyPressEvent } from 'react-use';
import useElectron from '../../../../providers/ElectronProvider';
import { maxToggleTunedChannelCount } from '../rules';

export default React.memo(function LineRow({
  index,
  line,
  handleSelectLine,
  isSelected,
}: {
  index: number; // the order of this one in the list (for this view to know the shortcut to register)
  line: MasterLineData;
  handleSelectLine: (newLineId: string) => void;
  isSelected: boolean;
}) {
  const { user } = useAuth();
  const { desktopMode, isWindowFocused } = useElectron();

  const handleActivateLine = useCallback(() => {
    handleSelectLine(line.lineDetails._id.toString());
  }, [handleSelectLine, line.lineDetails, index]);

  const hotkeyActivateLine = useCallback(() => {
    // TODO: disable for higher numbers? ehh maybe hidden easter egg to select more?

    // if (isUserToggleTuned) handleActivateLine();

    handleActivateLine();
  }, [handleActivateLine]);

  useKeyPressEvent((index + 1).toString(), hotkeyActivateLine);

  const renderRightActivity = useMemo(() => {
    if (isSelected) {
      return (
        <Tooltip title={'esc'}>
          <span className="flex flex-col items-center gap-2 cursor-pointer">
            <FiX className="text-gray-400 text-xl" />
          </span>
        </Tooltip>
      );
    }

    if (line.profilePictures.broadcastMembers.length > 0)
      return (
        <Avatar.Group
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
          {line.profilePictures.broadcastMembers.map((pictureSrc, index) => (
            <Avatar
              key={`lineRowActiveBroadcasters-${index}`}
              src={pictureSrc}
              shape="square"
              size={'small'}
            />
          ))}
        </Avatar.Group>
      );

    if (line.profilePictures.tunedMembers.length > 0)
      return <FiSun className="text-teal-500 animate-pulse" />;

    // if there is new activity blocks for me
    if (line.currentUserMember.lastVisitDate)
      return <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span>;

    // TODO: compare last visit date to latest content block
    if (line.currentUserMember)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {moment(line.currentUserMember.lastVisitDate).fromNow(true)}
        </span>
      );

    return (
      <span className={`text-gray-200 ml-auto text-xs `}>
        {moment(line.currentUserMember.lastVisitDate).fromNow(true)}
      </span>
    );
  }, [line, isSelected]);

  // TODO: low priority: scale the whole thing and make it pop out nad translate...
  // doesn't work right now because no workaround for overflow scroll for y and visible for x
  return (
    <div
      onClick={handleActivateLine}
      role={'presentation'}
      className={`flex flex-row items-center justify-start gap-2 px-4 py-4 hover:bg-gray-200 
      cursor-pointer transition-all relative z-50 

      ${line.isUserToggleTuned && ' bg-gray-100 shadow-2xl'}
      
      ${line.isUserTunedIn && isSelected && ' bg-gray-200 shadow-2xl'}`}
    >
      {/* channel picture */}
      {line.profilePictures && (
        <span className={`${isSelected && ' scale-125 transition-all'}`}>
          <LineIcon
            grayscale={!line.isUserTunedIn}
            sourceImages={
              line.profilePictures.tunedMembers.length > 0
                ? line.profilePictures.tunedMembers
                : line.profilePictures.allMembersWithoutMe
            }
          />
        </span>
      )}

      {/* channel name */}
      <span
        className={`text-md max-w-[180px] truncate text-gray-300 ${
          line.currentUserMember.lastVisitDate ? 'font-semibold text-gray-800' : ''
        }`}
      >
        {line.lineDetails.name || line.otherUserObjects[0].givenName}
      </span>

      {index < maxToggleTunedChannelCount && (
        <span className="ml-2 text-gray-300 text-xs p-1 px-2 bg-gray-100">{`${index + 1}`}</span>
      )}

      <div className="ml-auto flex flex-shrink-0">{renderRightActivity}</div>
    </div>
  );
});
