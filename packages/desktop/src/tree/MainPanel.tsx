import { Container, Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useRef } from 'react';

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
  console.log('selected room contents');
  console.log(masterConversation);

  return (
    <Container maxWidth={'md'}>
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
    </Container>
  );
}

function Video({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} muted autoPlay height={'400'} width={'600'} />;
}
