import { FiActivity, FiSun } from 'react-icons/fi';
import {
  RtcAnswerRequest,
  RtcCallRequest,
  RtcNewUserResponse,
  RtcReceiveAnswerResponse,
  ServerResponseChannels,
  SomeoneUntunedFromLineResponse,
} from '@nirvana/core/sockets/channels';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { $selectedLineId } from '../../../controller/recoil';
import { Avatar } from 'antd';
import LineIcon from '../lineIcon';
import { LineMemberState } from '@nirvana/core/models/line.model';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import Peer from 'simple-peer';
import { ServerRequestChannels } from '@nirvana/core/sockets/channels';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useGetUserDetails } from '../../../controller/index';
import { useLineDataProvider } from '../../../controller/lineDataProvider';
import { useRecoilState } from 'recoil';

// todo: send a much more comprehensive master line object? or just add properties to the
// masterLineData object so that we don't have different models to maintain between client and server

export default function LineRow({
  masterLineData,
  handleSelectLine,
}: {
  masterLineData: MasterLineData;
  handleSelectLine: (lineId: string) => void;
}) {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const { data: userData } = useGetUserDetails();

  useEffect(() => {
    console.warn('mounting linerow');

    return () => console.warn('UNMOUNTING line row');
  }, []);

  // take the source of truth list of memeberIds tuned in, and see if I'm in it
  const isUserTunedIn = useMemo(
    () =>
      masterLineData.tunedInMemberIds?.includes(userData?.user?._id.toString()),
    [masterLineData.tunedInMemberIds, userData]
  );

  /**
   * TODO: slowly add to this and fix based on added features
   * */
  const renderActivityIcon = useMemo(() => {
    // if there is someone or me broadcasting here
    if (masterLineData.currentBroadcastersUserIds?.length > 0)
      return <FiSun className='text-teal-500 animate-pulse' />;

    if (isUserTunedIn)
      return <FiActivity className='text-black animate-pulse' />;

    // if there is new activity blocks for me
    if (masterLineData.currentUserMember.lastVisitDate)
      return (
        <span className='h-2 w-2 rounded-full bg-slate-800 animate-pulse'></span>
      );

    return (
      <span className='h-2 w-2 rounded-full bg-white animate-pulse'></span>
    );
  }, [masterLineData, isUserTunedIn]);

  const renderRightActivity = useMemo(() => {
    // TODO: get the profile pictures of the broadcasters
    if (masterLineData.currentBroadcastersUserIds?.length > 0)
      return (
        <Avatar.Group
          key={`lineRowRightActivityGroup-${masterLineData.lineDetails._id.toString()}`}
          maxCount={2}
          maxPopoverTrigger='click'
          size='small'
          maxStyle={{
            color: '#f56a00',
            backgroundColor: '#fde3cf',
            cursor: 'pointer',
            borderRadius: '0',
          }}
          className='shadow-lg'
        >
          {masterLineData.otherUserObjects?.map((otherUser, index) => (
            <Avatar
              key={`lineListActivitySection-${otherUser._id.toString()}-${index}`}
              src={otherUser.picture ?? ''}
              shape='square'
              size={'small'}
            />
          ))}
        </Avatar.Group>
      );

    // if there is new activity/black dot, then show relative time as little bolder? or too much?

    // TODO: compare last visit date to latest audio block
    if (false)
      return (
        <span className={`text-gray-400 ml-auto text-xs font-semibold`}>
          {moment(masterLineData.currentUserMember.lastVisitDate).fromNow(true)}
        </span>
      );

    return (
      <span className={`text-gray-300 ml-auto text-xs `}>
        {moment(masterLineData.currentUserMember.lastVisitDate).fromNow(true)}
      </span>
    );
  }, [masterLineData]);

  const profilePictures = useMemo(() => {
    const pictureSources: string[] = [];

    // ?don't add in my image as that's useless contextually?
    // if (userData?.user?.picture) pictureSources.push(userData.user.picture);

    masterLineData.otherUserObjects?.forEach((otherUser) => {
      if (otherUser.picture) pictureSources.push(otherUser.picture);
    });

    return pictureSources;
  }, [masterLineData, userData]);

  return (
    <>
      <div
        onClick={() =>
          handleSelectLine(masterLineData.lineDetails._id.toString())
        }
        className={`flex flex-row items-center justify-start gap-2 p-2 px-4 h-14 hover:bg-gray-200 cursor-pointer transition-all
  last:border-b-0 border-b border-b-gray-200 relative z-50 rounded ${
    selectedLineId === masterLineData.lineDetails._id.toString() &&
    'bg-gray-200 scale-110 shadow-2xl translate-x-3'
  }`}
      >
        {/* status dot */}
        <div className='flex-shrink-0 h-4 w-4'>{renderActivityIcon}</div>

        {profilePictures && (
          <LineIcon grayscale={!isUserTunedIn} sourceImages={profilePictures} />
        )}

        <h2
          className={`text-inherit text-md max-w-[220px] truncate text-slate-800 ${
            masterLineData.currentUserMember.lastVisitDate
              ? 'font-semibold'
              : ''
          }`}
        >
          {masterLineData.lineDetails.name ||
            masterLineData.otherUserObjects[0].givenName}
        </h2>

        <div className='ml-auto flex-shrink-0'>{renderRightActivity}</div>
      </div>

      {/* mounts and unmounts based on if in the room or now */}
      {/* {isUserTunedIn && (
        <StreamRoom
          lineId={masterLineData.lineDetails._id.toString()}
          currentBroadcasters={masterLineData.currentBroadcastersUserIds}
          tunedInUsers={masterLineData.tunedInMemberIds}
        />
      )} */}
    </>
  );
}

type PeerMap = { [userId: string]: Peer };

function StreamRoom({
  lineId,
  tunedInUsers,
  currentBroadcasters,
}: {
  lineId: string;
  tunedInUsers?: string[];
  currentBroadcasters?: string[];
}) {
  // ?could move this up the tree and pass it down? or set it in the header?
  // local stream specifically for this stream room
  const [localStream, setLocalStream] = useState<MediaStream>();
  const userStreamTagRef = useRef<HTMLVideoElement>(null);
  const { data: userDetails } = useGetUserDetails();

  // local peer map of userIds to peers
  const [userPeers, setUserPeers] = useState<PeerMap>({});

  // ws listen to events of user disconnecting and such or rely on tunedin members prop
  const { $ws } = useLineDataProvider();

  // todo: get the right constraints based on user settings...audio, video, or none? header selections? make a decision
  useEffect(() => {
    if (userDetails) {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            autoGainControl: true,
          },
        })
        .then((userStream) => {
          setLocalStream(userStream);

          if (userStreamTagRef?.current)
            userStreamTagRef.current.srcObject = userStream;

          // alternative to dom element
          // const audio = new Audio();
          // audio.autoplay = true;
          // audio.srcObject = userStream;

          // !TEST STUFF : removing distortion with headphones in
          // test distortion to go away on disabling audio
          // setTimeout(() => {
          //   console.log("stopping audio stream ");

          //   userStream.getTracks().forEach((track) => {
          //     track.enabled = !track.enabled;

          //     track.stop();
          //   });
          // }, 0);

          // take the initial list of tunedInUsers without my own id
          const everyOtherTunedUserId = tunedInUsers.filter(
            (tunedUserId) => tunedUserId !== userDetails?.user._id.toString()
          );

          const localPeerConnections: PeerMap = {};

          everyOtherTunedUserId.forEach((otherTunedInUserId) => {
            // create local peer objects for them
            const localPeerInitiator = new Peer({
              initiator: true,
              stream: userStream,
              trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
            });

            // set it for our map that we will iterate through to display streams in other child view
            localPeerConnections[otherTunedInUserId] = localPeerInitiator;

            // notify each one with specific signal
            localPeerInitiator.on('signal', (signal) => {
              $ws.emit(
                ServerRequestChannels.RTC_CALL_REQUEST,
                new RtcCallRequest(lineId, otherTunedInUserId, signal)
              );
            });
          });

          setUserPeers(localPeerConnections);

          // answer calls
          $ws.on(
            `${ServerResponseChannels.RTC_NEW_USER_JOINED_RESPONSE_PREFIX}:${lineId}`,
            (res: RtcNewUserResponse) => {
              // create a local peer connection for this new user

              console.log(
                'ooo newbie joined room, I guess I will accept it and send him my signal'
              );
              console.log(res);

              var peerForMeAndNewbie = new Peer({
                initiator: false,
                trickle: false, // prevents the multiple tries on different ice servers and signal from getting called a bunch of times
                stream: userStream, // add in my own stream that I got before
              });

              peerForMeAndNewbie.on('signal', (signal) => {
                console.log(
                  'as the answerer, I am going to send back my signal so that the newbie can update his local peer for me'
                );
                $ws.emit(
                  ServerRequestChannels.RTC_ANSWER_REQUEST,
                  new RtcAnswerRequest(lineId, res.newUserId, signal)
                );
              });

              peerForMeAndNewbie.signal(res.simplePeerSignal);

              setUserPeers((prevUsersPeers) => {
                const newUserPeers = { ...prevUsersPeers };

                newUserPeers[res.newUserId] = peerForMeAndNewbie;

                return newUserPeers;
              });
            }
          );

          // take care of answers recevied
          $ws.on(
            `${ServerResponseChannels.RTC_RECEIVING_ANSWER_RESPONSE_PREFIX}:${lineId}`,
            (res: RtcReceiveAnswerResponse) => {
              console.log(
                `oooo some master received my call and accepted it ${JSON.stringify(
                  res
                )}`
              );
              console.log(res);

              // find the peer we created earlier for this master
              // ?is this okay? using the setter to get the current state?
              setUserPeers((previousUserPeersMap) => {
                const newUserPeerMap = { ...previousUserPeersMap };

                console.log(
                  'here is the current peers map',
                  previousUserPeersMap
                );

                const peerForAnswerer = newUserPeerMap[res.answererUserId];

                if (peerForAnswerer) {
                  peerForAnswerer.signal(res.simplePeerSignal);
                } else {
                  console.error(
                    'could not find the peer we created before for this master'
                  );
                }

                // note needed to change state so that the peer object that gets iterated in dom isn't the old referenced one/we trigger refresh for the child component
                return newUserPeerMap;
              });
            }
          );

          $ws.on(
            `${ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE}:${lineId}`,
            (res: SomeoneUntunedFromLineResponse) => {
              // find the peer object and remove from our userPeers map
              // will also cause unmounting the child component which destroys peer object but also can destroy here
            }
          );
        })
        .catch((error) => {
          console.error(error);

          toast.error(
            'Make sure that you have permissions enabled and microphone connected'
          );
        });
    }

    // TODO: p1 : destroy peers on load
    // ! remove ws handlers so that the same channels don't get triggered twice when I retune into this line
    return () => {
      $ws.removeListener(
        `${ServerResponseChannels.RTC_RECEIVING_ANSWER_RESPONSE_PREFIX}:${lineId}`
      );
      $ws.removeListener(
        `${ServerResponseChannels.RTC_NEW_USER_JOINED_RESPONSE_PREFIX}:${lineId}`
      );
    };
  }, [userDetails, setUserPeers]);

  // calculate diff to clean our userPeerMap to unmount and detroy certain peer connections
  useEffect(() => {}, [tunedInUsers]);

  useEffect(() => {
    console.log('keeping an eye on user peers map');
    console.log(userPeers);
  }, [userPeers]);

  // todo, someone tell the main object that I am finally connected after everything...different than tuned in

  // TODO: p1...when the peer map user count > tunedIn.length, then we get rid of the right person from list cuzz they have officially left or disconnected
  useEffect(() => {
    console.log('change in tuned in users in the streaming room!!!');

    setUserPeers((prevUserPeersMap) => {
      // go through the userIds here
      // if tunedIn users doesn't have a userId, this guy prolly disconnected

      const newMap = { ...prevUserPeersMap }; //ensures going through the list of peers again to remove specific ones

      const otherUserIdsPeers = Object.keys(prevUserPeersMap);

      otherUserIdsPeers.forEach((otherUserId) => {
        // problem if we are trying to show stream of someone who is not tuned in
        if (!tunedInUsers.includes(otherUserId)) {
          console.log('user left with id:', otherUserId);
          const disconnectedLocalPeer = newMap[otherUserId];

          if (disconnectedLocalPeer) {
            disconnectedLocalPeer.peer?.destroy();
            delete newMap[otherUserId];
          }
        }
      });

      return newMap;
    });
  }, [tunedInUsers]);

  // todo: when user isUserBroadcasting is false, disable localUserStream in this component
  // and also emit, which should already have been done

  // we only loop through peers that are associated to user Ids which exist in the currentBroadcasters array
  return (
    <>
      <audio autoPlay muted ref={userStreamTagRef} controls />
      this is the video of people
      {userPeers &&
        Object.entries(userPeers).map(([userId, peer]) => (
          <PeerStreamRenderer
            key={userId}
            isBroadcasting={currentBroadcasters?.includes(userId)}
            peer={peer}
          />
        ))}
    </>
  );
}

/**
 * take in the specified peer and whether or not he is broadcasting
 */
function PeerStreamRenderer({
  peer,
  isBroadcasting,
}: {
  peer: Peer;
  isBroadcasting: boolean;
}) {
  const streamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on('stream', (remotePeerStream: MediaStream) => {
      console.log(
        'stream coming in from remote peer...BUT, only going to show once they broadcast'
      );

      if (streamRef?.current) streamRef.current.srcObject = remotePeerStream;
    });

    return () => peer.destroy();
  }, [streamRef]);

  // when someone is broadcasting, we enable their stream

  return (
    <>
      <audio muted={!isBroadcasting} autoPlay controls ref={streamRef} />
    </>
  );
}
