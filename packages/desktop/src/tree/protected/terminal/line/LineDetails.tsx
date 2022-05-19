import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import useAuth from '../../../../providers/AuthProvider';
import useStreams from '../../../../providers/StreamProvider';

import { LineMemberState } from '@nirvana/core/models/line.model';
import LineIcon from '../../../../components/lineIcon';
import {
  FiActivity,
  FiHeadphones,
  FiImage,
  FiMoreVertical,
  FiSearch,
  FiSettings,
  FiSun,
  FiUsers,
  FiVideo,
  FiX,
} from 'react-icons/fi';
import { Avatar, Tooltip } from 'antd';
import { useKeyPressEvent } from 'react-use';
import useTerminalProvider from '../../../../providers/TerminalProvider';
import Peer from 'simple-peer';

export default function LineDetails() {
  const { user } = useAuth();

  const { selectedLineId, roomsMap, handleUpdateLineMemberState } = useTerminalProvider();

  const selectedLine = useMemo(() => roomsMap[selectedLineId], [selectedLineId, roomsMap]);

  const isUserToggleTuned = useMemo(
    () => selectedLine?.currentUserMember?.state === LineMemberState.TUNED,
    [selectedLine],
  );

  const { peerMap } = useStreams();

  // seeing if I am in the list of broadcasters
  // the source of truth from the socket connections telling me if my clicking actually made a round trip
  const isUserBroadcasting = useMemo(
    () => selectedLine?.currentBroadcastersUserIds?.includes(user._id.toString()),
    [user, selectedLine],
  );

  // showing all tuned in members...they may not hear me since they might be doing something else
  // but feeling of presentness
  const tunedProfiles = useMemo(() => {
    const pictureSources: { name: string; pictureSrc: string }[] = [];

    selectedLine.tunedInMemberIds?.forEach((tunedInMemberUserId) => {
      // don't want to see my own picture
      // TODO: don't show myself!?
      if (tunedInMemberUserId === user._id.toString()) {
        pictureSources.push({
          name: user.givenName,
          pictureSrc: user.picture,
        });
        return;
      }

      const otherUserObject = selectedLine.otherUserObjects?.find(
        (userObj) => userObj._id.toString() === tunedInMemberUserId,
      );
      if (otherUserObject?.picture)
        pictureSources.push({
          name: otherUserObject.givenName,
          pictureSrc: otherUserObject.picture,
        });
    });

    return pictureSources;
  }, [selectedLine, user]);

  // pics for the line icons
  const profilePictures = useMemo(() => {
    const pictureSources: string[] = [];

    // ?don't add in my image as that's useless contextually?
    // if (userData?.user?.picture) pictureSources.push(userData.user.picture);

    selectedLine.otherUserObjects?.forEach((otherUser) => {
      if (otherUser.picture) pictureSources.push(otherUser.picture);
    });

    return pictureSources;
  }, [selectedLine]);

  return (
    <div className="flex flex-col flex-1 bg-white relative overflow-auto">
      {/* line details */}
      <div
        className="p-5 z-30 titlebar
        flex flex-row items-center justify-end border-b-gray-200 border-b shadow-2xl group"
      >
        {profilePictures && <LineIcon grayscale={false} sourceImages={profilePictures} />}

        <div className="ml-2 mr-auto flex flex-col items-start ">
          <span className="flex flex-row gap-2 items-center">
            <h2 className={`text-md text-gray-800 font-semibold`}>
              {selectedLine.lineDetails.name || selectedLine.otherUserObjects[0].givenName}
            </h2>

            <button
              className={`p-1 hidden group-hover:flex justify-center items-center hover:bg-gray-300
           transition-all hover:scale-105`}
            >
              <FiSettings className="text-gray-400 text-xs" />
            </button>
          </span>
        </div>

        <Avatar.Group className={'animate-pulse'}>
          {tunedProfiles.map((otherUser) => (
            <Avatar
              key={`lineTunedInUserAvatar-${otherUser.name}`}
              src={otherUser.pictureSrc}
              shape="square"
              size={'large'}
              className={`shadow-lg`}
            />
          ))}
        </Avatar.Group>

        <span className="px-10 text-gray-200"> | </span>

        <Avatar.Group>
          {selectedLine.otherUserObjects.map((otherUser) => (
            <Avatar
              key={`lineOfflineUserAvatar-${1}`}
              src={otherUser.picture}
              shape="square"
              size={'default'}
              // grayscale if not playing?
              className={`${true && 'grayscale'}`}
            />
          ))}
        </Avatar.Group>
      </div>

      {/* main canvas */}
      <div className="flex flex-col flex-1">
        {/* line timeline */}
        {/* <LineHistory /> */}

        {/* live line */}
        <div
          className="flex-1 flex flex-col justify-start items-center 
        gap-2 p-5 mx-auto max-w-lg w-full"
        >
          {Object.keys(peerMap).map((lineId, index) => {
            if (lineId !== selectedLine.lineDetails._id.toString()) return <></>;

            return peerMap[lineId].map(
              (linePeer) =>
                linePeer?.peerMediaStream && (
                  <StreamPlayer
                    key={`streamPlayer-${index}`}
                    peerStream={linePeer.peerMediaStream}
                  />
                ),
            );
          })}
        </div>
      </div>

      {/* canvas action buttons */}
      <div className="absolute right-5 bottom-5 flex flex-row gap-3 p-10 justify-end items-center ">
        <Tooltip
          placement="left"
          title={`${isUserToggleTuned ? 'click to untoggle' : 'click to stay tuned in'}`}
        >
          <button
            className={`p-2 flex justify-center items-center shadow-lg
          hover:scale-105 transition-all animate-pulse ${
            isUserToggleTuned ? 'bg-gray-800 text-white' : 'text-black'
          }`}
            onClick={() =>
              isUserToggleTuned
                ? handleUpdateLineMemberState(
                    selectedLine.lineDetails._id.toString(),
                    LineMemberState.INBOX,
                  )
                : handleUpdateLineMemberState(
                    selectedLine.lineDetails._id.toString(),
                    LineMemberState.TUNED,
                  )
            }
          >
            <FiActivity className="text-md" />
          </button>
        </Tooltip>

        <Tooltip title={'Press and hold ` or click to join the room'}>
          <button
            className={`p-3 flex justify-center items-center shadow-2xl
            hover:scale-105 transition-all ${
              isUserBroadcasting ? 'bg-teal-800 text-white' : 'text-teal-800 border-teal-800 border'
            }`}
          >
            <FiSun className="text-lg" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function StreamPlayer({ peerStream }: { peerStream: MediaStream }) {
  const streamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (streamRef?.current) streamRef.current.srcObject = peerStream;
  }, [peerStream]);

  return (
    <>
      this is a stream component of one remote peer
      <video
        ref={streamRef}
        height={400}
        width={400}
        className={'shadow-xl rounded'}
        autoPlay
        muted
      />
    </>
  );
}

// function LineHistory() {
//   return (
//     <div
//       className="flex-1 flex flex-col justify-start items-center gap-2 p-5 mx-auto
//     max-w-lg w-full bg-white"
//     >
//       <span className={'text-gray-300 text-sm cursor-pointer hover:underline'}>load more</span>

//       <span className={'text-gray-300 text-sm'}>yesterday</span>

//       <div
//         className={`rounded flex flex-row items-center gap-2 w-full
//     p-5 border-gray-200 border`}
//       >
//         <Avatar.Group key={`lineHistoryMessage-yesterday-afternoon}`}>
//           {selectedLine.otherUserObjects.map((otherUser) => (
//             <Avatar
//               key={`linehistory-${1}`}
//               src={otherUser.picture}
//               shape="square"
//               size={'default'}
//               // grayscale if not playing?
//               className={`${true && 'grayscale'}`}
//             />
//           ))}
//         </Avatar.Group>

//         {selectedLine.otherUserObjects.map((otherUser) => (
//           <span key={`chunk-${otherUser.name}`} className="text-gray-500">
//             {`${otherUser.givenName}, `}
//           </span>
//         ))}

//         <span className="ml-auto text-xs text-gray-300">{`${Math.floor(Math.random() * 10) + 1}:${
//           Math.floor(Math.random() * 100) + 10
//         }pm |`}</span>

//         <span className="text-gray-400 text-md">{`${
//           Math.floor(Math.random() * 60) + 1
//         } seconds`}</span>
//       </div>

//       <span className={'text-gray-300 text-sm'}>today</span>

//       <div
//         className={`rounded flex flex-row items-center gap-2 w-full shadow-lg p-5
//   border-gray-200 border`}
//       >
//         <Avatar.Group key={`lineHistoryMessage-yesterday-afternoon}`}>
//           {selectedLine.otherUserObjects.map((otherUser) => (
//             <Avatar
//               key={`linehistory-${1}`}
//               src={otherUser.picture}
//               shape="square"
//               size={'default'}
//               // grayscale if not playing?
//               className={`${true && 'grayscale'}`}
//             />
//           ))}
//         </Avatar.Group>

//         {selectedLine.otherUserObjects.map((otherUser) => (
//           <span key={`chunk-${otherUser.name}`} className="text-gray-500">
//             {`${otherUser.givenName}, `}
//           </span>
//         ))}

//         <span className="ml-auto text-xs text-gray-300">{`${Math.floor(Math.random() * 10) + 1}:${
//           Math.floor(Math.random() * 100) + 10
//         }pm |`}</span>

//         <span className="text-gray-400 text-md">{`${
//           Math.floor(Math.random() * 60) + 1
//         } seconds`}</span>
//       </div>

//       <span className={'text-teal-500 text-sm flex flex-row gap-2 items-center mt-5'}>
//         <FiSun />
//         <span>right now</span>
//       </span>

//       {/* live broadcasters */}
//       <div className="flex flex-col w-full gap-2 shadow-2xl border border-teal-500 rounded">
//         {selectedLine.otherUserObjects.map((otherUser) => (
//           <div key={otherUser.email} className="flex flex-row items-center gap-2 p-4">
//             <Avatar
//               key={`linehistory-${1}`}
//               src={otherUser.picture}
//               shape="square"
//               size={'large'}
//             />

//             <span className="text-gray-600 font-semibold">{otherUser.name}</span>

//             <FiHeadphones className="ml-auto text-lg" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
