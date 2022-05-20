import React, { useMemo, useEffect, useRef } from 'react';
import useAuth from '../../../../providers/AuthProvider';
import useStreams from '../../../../providers/StreamProvider';

import { LineMemberState } from '@nirvana/core/models/line.model';
import LineIcon from '../../../../components/lineIcon';
import { FiActivity, FiSettings, FiSun } from 'react-icons/fi';
import { Avatar, Tooltip } from 'antd';
import useTerminalProvider from '../../../../providers/TerminalProvider';

export default function LineDetails() {
  const { user } = useAuth();

  const { selectedLineId, allChannels, handleUpdateLineMemberState } = useTerminalProvider();

  const selectedLine = useMemo(
    () =>
      allChannels.find((currChannel) => currChannel.lineDetails._id.toString() === selectedLineId),
    [selectedLineId, allChannels],
  );

  const isUserToggleTuned = useMemo(
    () => selectedLine?.currentUserMember?.state === LineMemberState.TUNED,
    [selectedLine],
  );

  const { peerMap } = useStreams();

  const isUserBroadcasting = useMemo(
    () => selectedLine?.currentBroadcastersUserIds?.includes(user._id.toString()),
    [user, selectedLine],
  );

  return (
    <div className="flex flex-col flex-1 bg-white relative overflow-auto">
      {/* line details */}
      <div
        className="p-5 z-30 titlebar
        flex flex-row items-center justify-end border-b-gray-200 border-b shadow-2xl group"
      >
        {/* channel picture */}
        {selectedLine.profilePictures && (
          <LineIcon
            grayscale={!selectedLine.isUserTunedIn}
            sourceImages={
              selectedLine.profilePictures.tunedMembers.length > 0
                ? selectedLine.profilePictures.tunedMembers
                : selectedLine.profilePictures.allMembersWithoutMe
            }
          />
        )}

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
          <Avatar
            key={`lineTunedInUserAvatar-${-1}`}
            src={user.picture}
            shape="square"
            size={'large'}
            className={`shadow-lg`}
          />

          {selectedLine.profilePictures?.tunedMembers?.map((pictureSrc, index) => (
            <Avatar
              key={`lineTunedInUserAvatar-${index}`}
              src={pictureSrc}
              shape="square"
              size={'large'}
              className={`shadow-lg`}
            />
          ))}
        </Avatar.Group>

        <span className="px-10 text-gray-200"> | </span>

        <Avatar.Group>
          {selectedLine.profilePictures.untunedMembers.map((pictureSrc, index) => (
            <Avatar
              key={`lineOfflineUserAvatar-${index}`}
              src={pictureSrc}
              shape="square"
              size={'default'}
              // grayscale if not playing?
              className={`grayscale`}
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
          <span className="flex flex-row gap-2 items-center mx-auto text-center mt-5 text-teal-500">
            <FiSun />
            <span>Right now</span>
          </span>

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
    <video
      ref={streamRef}
      height={350}
      width={400}
      className={'shadow-xl rounded'}
      autoPlay
      muted
    />
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
