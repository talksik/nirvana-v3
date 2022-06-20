import { CardMedia, Container, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { FiSun, FiUserPlus, FiZap } from 'react-icons/fi';
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
  return (
    <Container maxWidth={false} disableGutters>
      <Stack direction={'column'}>
        <Box sx={{ p: 2, boxShadow: 3, zIndex: 10 }}>
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
              <Tooltip title="Add to priority panel!">
                <IconButton size="small">
                  <FiZap />
                </IconButton>
              </Tooltip>

              <Tooltip title="Add people to the conversation">
                <IconButton size="small">
                  <FiUserPlus />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <Grid container>
          {masterConversation.room &&
            Object.entries(masterConversation.room).map(([userId, userPeerContents]) => {
              return (
                <Grid item key={`userPeerRenderConvoDetails-${userId}`}>
                  <Video stream={userPeerContents.stream} />
                </Grid>
              );
            })}
        </Grid>
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
