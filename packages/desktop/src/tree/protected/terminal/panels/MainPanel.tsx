import React, { useMemo, useEffect, useRef } from 'react';
import useAuth from '../../../../providers/AuthProvider';
import useRealTimeRooms from '../../../../providers/RealTimeRoomProvider';

import { LineMemberState } from '@nirvana/core/models/line.model';
import LineIcon from '../../../../components/lineIcon';
import { FiActivity, FiHeadphones, FiSettings, FiSun } from 'react-icons/fi';
import { Avatar, Tooltip } from 'antd';
import useStreams from '../../../../providers/StreamProvider';
import Peer from 'simple-peer';

export default function MainPanel() {
  const { user } = useAuth();

  const { selectedLineId } = useRealTimeRooms();

  // already won't see stuff for overlay only mode as per parent configuration

  // TODO: if there is stuff in search, show that first

  // if selected line, show line details
  if (selectedLineId) return <LineDetails />;

  // else show the stale state

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

function LineDetails() {
  const { user } = useAuth();

  const { selectedLineId, roomsMap, handleUpdateLineMemberState } = useRealTimeRooms();

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
        pictureSources.push();

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
  }, [selectedLine, user]);

  return (
    <div
      className="flex flex-col flex-1 bg-gray-100 
      border-l border-l-gray-200 relative p-10"
    >
      {/* line timeline */}
      <div className="flex flex-col items-center gap-2 my-2 mx-auto max-w-lg w-full">
        <span className={'text-gray-300 text-sm cursor-pointer hover:underline'}>load more</span>

        <span className={'text-gray-300 text-sm'}>yesterday</span>

        <div className={'rounded flex flex-row items-center gap-2 w-full p-5'}>
          <Avatar.Group key={`lineHistoryMessage-yesterday-afternoon}`}>
            {selectedLine.otherUserObjects.map((otherUser) => (
              <Avatar
                key={`linehistory-${1}`}
                src={otherUser.picture}
                shape="square"
                size={'large'}
                // grayscale if not playing?
                className={`${true && 'grayscale'}`}
              />
            ))}
          </Avatar.Group>

          {selectedLine.otherUserObjects.map((otherUser) => (
            <span key={`chunk-${otherUser.name}`} className="text-gray-500">
              {`${otherUser.givenName}, `}
            </span>
          ))}

          <span className="ml-auto text-xs text-gray-300">{`${Math.floor(Math.random() * 10) + 1}:${
            Math.floor(Math.random() * 100) + 10
          }pm |`}</span>

          <span className="text-gray-400 text-md">{`${
            Math.floor(Math.random() * 60) + 1
          } seconds`}</span>
        </div>

        <span className={'text-gray-300 text-sm'}>today</span>

        <div className={'rounded flex flex-row items-center gap-2 w-full shadow-lg p-5'}>
          <Avatar.Group key={`lineHistoryMessage-yesterday-afternoon}`}>
            {selectedLine.otherUserObjects.map((otherUser) => (
              <Avatar
                key={`linehistory-${1}`}
                src={otherUser.picture}
                shape="square"
                size={'large'}
                // grayscale if not playing?
                className={`${true && 'grayscale'}`}
              />
            ))}
          </Avatar.Group>

          {selectedLine.otherUserObjects.map((otherUser) => (
            <span key={`chunk-${otherUser.name}`} className="text-gray-500">
              {`${otherUser.givenName}, `}
            </span>
          ))}

          <span className="ml-auto text-xs text-gray-300">{`${Math.floor(Math.random() * 10) + 1}:${
            Math.floor(Math.random() * 100) + 10
          }pm |`}</span>

          <span className="text-gray-400 text-md">{`${
            Math.floor(Math.random() * 60) + 1
          } seconds`}</span>
        </div>

        {/* <LineStreams broadcasters={selectedLine.tunedInMemberIds} /> */}
      </div>

      {/* live broadcasters */}
      <div className="flex flex-col items-center gap-2 mx-auto w-full max-w-lg mt-auto">
        <span className={'flex flex-row gap-2 items-center text-teal-500 text-sm'}>
          <FiSun className="animate-pulse" />
          <span>right now</span>
        </span>

        <div
          className={
            'rounded flex flex-col items-center gap-2 w-full p-2 shadow-2xl border border-teal-500'
          }
        >
          {selectedLine.otherUserObjects.map((otherUser) => (
            <div
              key={`linehistory-${otherUser.name}`}
              className={'flex flex-row gap-2 w-full items-center animate-pulse p-5'}
            >
              <Avatar src={otherUser.picture} shape="square" size={'large'} />

              <span key={`chunk-${otherUser.name}`} className="text-gray-600 font-semibold">
                {`${otherUser.name}`}
              </span>

              <span className="text-gray-600 text-md ml-auto">
                <FiHeadphones />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-3 bottom-3 flex flex-row gap-3 ">
        <Tooltip
          placement="left"
          title={`${isUserToggleTuned ? 'click to untoggle' : 'click to stay tuned in'}`}
        >
          <button
            className={`p-3 flex justify-center items-center shadow-lg
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
            <FiActivity className="text-lg" />
          </button>
        </Tooltip>
        <button
          className={`p-3 flex justify-center items-center shadow-2xl
          hover:scale-105 transition-all ${
            isUserBroadcasting ? 'bg-teal-800 text-white' : 'text-teal-800 border-teal-800 border'
          }`}
        >
          <FiSun className="text-lg" />
        </button>
      </div>
    </div>
  );
}

function LineStreams({ broadcasters }: { broadcasters: string[] }) {
  const { peerMap } = useStreams();

  console.log(peerMap);
  return (
    <div className="flex flex-col">
      {broadcasters?.map((userId) => {
        const currentPeer = peerMap[userId];

        return currentPeer && <Stream key={`streamDisplay-${userId}`} peer={currentPeer} />;
      })}
      this is the list of current streams we are going to show
    </div>
  );
}

function Stream({ peer }: { peer: Peer }) {
  const streamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on('stream', (remotePeerStream: MediaStream) => {
      console.log(
        'stream coming in from remote peer...BUT, only going to show once they broadcast',
      );

      // const audio = new Audio();
      // audio.autoplay = true;
      // audio.srcObject = remotePeerStream;

      if (streamRef?.current) streamRef.current.srcObject = remotePeerStream;
    });
  }, []);

  return (
    <>
      this is a stream component of one remote peer
      <video height={400} width={400} autoPlay muted ref={streamRef} />
    </>
  );
}
