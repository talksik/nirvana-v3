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
      border-l border-l-gray-200 relative"
    >
      {/* line details */}
      <div
        className="p-4
        flex flex-row items-center gap-2 justify-end border-b-gray-200 border-b"
      >
        {profilePictures && <LineIcon grayscale={false} sourceImages={profilePictures} />}

        <div className="flex flex-col items-start mr-auto group">
          <span className="flex flex-row gap-2 items-center">
            <h2 className={`text-lg text-slate-800 font-semibold`}>
              {selectedLine.lineDetails.name || selectedLine.otherUserObjects[0].givenName}
            </h2>

            <button
              className={`p-1 hidden group-hover:flex justify-center items-center hover:bg-gray-300
           transition-all hover:scale-105`}
            >
              <FiSettings className="text-gray-400 text-xs" />
            </button>
          </span>

          <span className="flex flex-row gap-2 items-center">
            <span className="text-gray-300 text-xs">{`${
              selectedLine.otherMembers?.length + 1 ?? 0
            } members`}</span>
            <span className="h-1 w-1 bg-gray-800 rounded-full"></span>
            <span className="text-teal-500 text-xs">{`${
              selectedLine.tunedInMemberIds?.length ?? 0
            } in this room`}</span>
          </span>
        </div>

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
      </div>

      {/* line timeline */}
      <div className="flex flex-col items-center gap-2 my-2 mx-auto max-w-lg w-full">
        <span className={'text-gray-300 text-sm cursor-pointer hover:underline'}>load more</span>

        <span className={'text-gray-300 text-sm'}>yesterday</span>

        <div className={'rounded border border-gray-200 flex flex-col w-full'}>
          {selectedLine.otherUserObjects.map((otherUser) => (
            <div
              key={`lineHistory-${otherUser._id.toString()}`}
              className="flex flex-row p-2 gap-2 items-center bg-transparent 
            border-b border-b-gray-200 last:border-b-0"
            >
              <Avatar
                key={`linehistory-${1}`}
                src={otherUser.picture}
                shape="square"
                size={'default'}
                // grayscale if not playing?
                className={`${true && 'grayscale'}`}
              />
              <span className="text-gray-500">{otherUser.givenName}</span>

              <span className="ml-auto text-xs text-gray-300">{`${
                Math.floor(Math.random() * 10) + 1
              }:${Math.floor(Math.random() * 100) + 10}pm |`}</span>

              <span className="text-gray-400 text-md">{`${
                Math.floor(Math.random() * 60) + 1
              } seconds`}</span>
            </div>
          ))}

          <div
            className="flex flex-row p-2 gap-2 items-center bg-transparent 
            border-b border-b-gray-200 last:border-b-0"
          >
            <Avatar
              key={`linehistory-${1}`}
              src={user.picture}
              shape="square"
              size={'default'}
              // grayscale if not playing?
              className={`${true && 'grayscale'}`}
            />
            <span className="text-gray-500">{'Arjun Patel'}</span>

            <span className="ml-auto text-xs text-gray-300">{`${
              Math.floor(Math.random() * 10) + 1
            }:${Math.floor(Math.random() * 100) + 10}pm |`}</span>

            <span className="text-gray-400 text-md">{`${
              Math.floor(Math.random() * 60) + 1
            } seconds`}</span>
          </div>
        </div>

        <span className={'text-gray-300 text-sm'}>today</span>

        <div className={'rounded border border-gray-400 flex flex-col w-full shadow-xl'}>
          {selectedLine.otherUserObjects.map((otherUser) => (
            // TODO: show the shadow if it's unheard
            <div
              key={`lineHistory-${otherUser._id.toString()}`}
              className="flex flex-row p-2 gap-2 items-center bg-transparent 
            border-b border-b-gray-400 last:border-b-0"
            >
              <Avatar
                key={`linehistory-${1}`}
                src={otherUser.picture}
                shape="square"
                size={'default'}
                // grayscale if not playing?
                className={`${false && 'grayscale'}`}
              />
              <span className="text-gray-600 font-semibold">{otherUser.name}</span>

              <span className="ml-auto text-xs text-gray-400">{`${
                Math.floor(Math.random() * 10) + 1
              }:${Math.floor(Math.random() * 100) + 10}pm |`}</span>

              <span className="text-gray-500 text-md">{`${
                Math.floor(Math.random() * 60) + 1
              } seconds`}</span>
            </div>
          ))}
        </div>

        {/* live broadcasters */}
        <span className={'flex flex-row gap-2 items-center text-teal-500 text-sm'}>
          <FiSun className="animate-ping" />
          <span>right now</span>
        </span>
        <div className={'rounded border border-teal-500 flex flex-col w-full shadow-2xl'}>
          {selectedLine.otherUserObjects.map((otherUser) => (
            <div
              key={`rightNowLineHistory-${otherUser._id.toString()}`}
              className="flex flex-row p-2 gap-2 items-center bg-transparent"
            >
              <Avatar
                key={`linehistory-${1}`}
                src={otherUser.picture}
                shape="square"
                size={'large'}
                // grayscale if not playing?
                className={`shadow-lg`}
              />
              <span className="text-gray-600 font-semibold">{otherUser.name}</span>

              <Tooltip title={'audio only'}>
                <FiHeadphones className="text-gray-600 text-md ml-auto" />
              </Tooltip>
            </div>
          ))}
        </div>

        {/* change to show only the broadcasters */}
        <LineStreams broadcasters={selectedLine.tunedInMemberIds} />
      </div>

      <button
        className={`p-3 absolute right-3 bottom-3 flex justify-center items-center shadow-2xl
          hover:scale-105 transition-all ${
            isUserBroadcasting ? 'bg-teal-800 text-white' : 'text-teal-800 border-teal-800 border'
          }`}
      >
        <FiSun className="text-lg" />
      </button>
    </div>
  );
}

function LineStreams({ broadcasters }: { broadcasters: string[] }) {
  const { peerMap } = useStreams();

  return (
    <div className="flex flex-col">
      {broadcasters.map((userId) => {
        const currentPeer = peerMap[userId];

        return <Stream key={`streamDisplay-${userId}`} peer={currentPeer} />;
      })}
    </div>
  );
}

function Stream({ peer }: { peer: Peer }) {
  const streamRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    peer.on('stream', (remotePeerStream: MediaStream) => {
      console.log(
        'stream coming in from remote peer...BUT, only going to show once they broadcast',
      );

      const audio = new Audio();
      audio.autoplay = true;
      audio.srcObject = remotePeerStream;

      if (streamRef?.current) streamRef.current.srcObject = remotePeerStream;
    });
  }, []);

  return <>this is a stream component of one remote peer</>;
}
