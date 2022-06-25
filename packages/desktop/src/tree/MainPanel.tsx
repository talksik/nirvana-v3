import {
  Avatar,
  AvatarGroup,
  Card,
  CardMedia,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { FiAirplay, FiLink, FiSun, FiUserPlus, FiZap } from 'react-icons/fi';
import React, { useEffect, useMemo, useRef } from 'react';

import { Box } from '@mui/system';
import ConversationLabel from '../subcomponents/ConversationLabel';
import { MasterConversation } from '../util/types';
// import ConversationDetails from './ConversationDetails';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import { useRendersCount } from 'react-use';

export default function MainPanel() {
  const { user } = useAuth();

  const { selectedConversation } = useConversations();

  // if selected conversation, show details
  // do all fetching necessary to paint things here
  // render room contents if there are people with video or other tracks

  const rendersCount = useRendersCount();
  // console.warn('RENDER COUNT | MAINPANEL | ', rendersCount);

  if (selectedConversation)
    return <ConversationDetails masterConversation={selectedConversation} />;

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        flex: 1,
        background: 'white',
      }}
    >
      <Typography variant="h6">{`Hi ${user.givenName?.split(' ')[0] ?? 'there'}!`}</Typography>
      <Typography variant="caption" align="center">
        Start a conversation with one tap <br /> or just take a breather.
      </Typography>
    </Container>
  );
}

function ConversationDetails({ masterConversation }: { masterConversation: MasterConversation }) {
  const { user } = useAuth();

  const isPriority = useMemo(() => {
    const personalConvoMember = masterConversation.members.find(
      (mem) => mem._id.toString() === user._id.toString(),
    );
    if (personalConvoMember && personalConvoMember.memberState === 'priority') {
      return true;
    }

    return false;
  }, [masterConversation, user]);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* conversation header details and controls */}
      <Box className={'titlebar'} sx={{ p: 2, boxShadow: 3, zIndex: 10 }} flexDirection={'column'}>
        <Stack direction="row" alignItems="center">
          <IconButton color="primary" size="small">
            <FiSun />
          </IconButton>
          <ConversationLabel
            users={masterConversation.members}
            conversationName={masterConversation.name}
            isSelected={true}
          />

          {/* conversation controls */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              ml: 'auto',
            }}
            spacing={1}
          >
            <Tooltip title="Paste image or link!">
              <IconButton size="small">
                <FiLink />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share screen!">
              <IconButton size="small">
                <FiAirplay />
              </IconButton>
            </Tooltip>

            <Divider orientation={'vertical'} flexItem />

            <Tooltip title="Add people to the conversation">
              <IconButton size="small">
                <FiUserPlus />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* live video and screenshares */}
        <Stack direction="row" alignItems={'center'}>
          {masterConversation.room &&
            Object.entries(masterConversation.room).map(([userId, userPeerContents]) => {
              return (
                <Video
                  key={`userPeerRenderConvoDetails-${userId}`}
                  stream={userPeerContents.stream}
                />
              );
            })}
        </Stack>
      </Box>

      <Stack direction={'column'} sx={{ flex: 1, overflowY: 'auto' }}>
        {/* main canvas */}
        <Container maxWidth={'sm'} sx={{ py: 2 }}>
          <Stack spacing={1} sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
            <Typography textAlign={'center'} color="GrayText" variant={'subtitle1'}>
              last week
            </Typography>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/2.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  Arjun Patel
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  6/18/22 | 2:35pm
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    1m 30s
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/1.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  James Pod
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  6/19/22 | 10:00am
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    7 sec
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    opacity: 0.2,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/2.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  Arjun Patel
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  6/19/22 | 4:02pm
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    25 sec
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>

          <Stack spacing={1} sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
            <Typography textAlign={'center'} color="GrayText" variant={'subtitle1'}>
              yesterday
            </Typography>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    opacity: 0.2,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/3.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  Joshua Bottle
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  11:35am
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    17 sec
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>

          <Stack spacing={1} sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
            <Typography textAlign={'center'} color="GrayText" variant={'subtitle1'}>
              today
            </Typography>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/2.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  Arjun Patel
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  4:02pm
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    22 sec
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" gap={2}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    opacity: 0.2,
                  }}
                  alt="Remy Sharp"
                  src="https://mui.com/static/images/avatar/4.jpg"
                />

                <Typography variant={'subtitle2'} color={'GrayText'}>
                  Mary Ann
                </Typography>

                <Typography variant={'caption'} color={'GrayText'}>
                  4:03pm
                </Typography>

                <Box marginLeft={'auto'}>
                  <Typography variant={'caption'} color={'GrayText'}>
                    2m 30s
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Stack>
    </Container>
  );
}

function Video({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
    }
  }, [stream]);

  return (
    <Box
      component={'video'}
      ref={videoRef}
      sx={{
        height: 300,
        boxShadow: 20,
      }}
    />
  );
}

const marks = [
  {
    value: 0,
    label: 'Arjun',
    avatar: <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/1.jpg" />,
  },
  {
    value: 20,
    label: 'Nick',
    avatar: <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/3.jpg" />,
  },
  {
    value: 37,
    label: 'Jeremy',
    avatar: <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/2.jpg" />,
  },
  {
    value: 100,
    label: '43 sec',
    avatar: <Avatar alt="Remy Sharp" src="https://mui.com/static/images/avatar/2.jpg" />,
  },
];

function valuetext(value: number) {
  return `${value}°C`;
}

// TODO: get label based on what region we are in
function valueLabelFormat(value: number) {
  return (
    marks.find((mark) => mark.value === value)?.avatar ?? (
      <Avatar alt="Agnes Walker" src="https://mui.com/static/images/avatar/5.jpg" />
    )
  );
}

function ConversationChunk() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
      <Stack direction={'row'} alignItems={'center'} justifyContent="flex-start" spacing={2}>
        <Avatar
          sx={{
            width: 10,
            height: 10,
          }}
          alt="Remy Sharp"
          src="https://mui.com/static/images/avatar/2.jpg"
        />

        <Typography variant={'subtitle2'} color={'GrayText'}>
          Arjun Patel
        </Typography>

        <Typography variant={'caption'} color={'GrayText'}>
          6/18/22
        </Typography>
      </Stack>
    </Card>
  );
}
