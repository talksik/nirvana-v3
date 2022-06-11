import { Box, Container, Grid } from '@mui/material';

import { ConversationList } from './ConversationList';
import MainPanel from './MainPanel';
import Navbar from './Navbar';
import NewConversationDialog from './NewConversationDialog';
import React from 'react';
import { blueGrey } from '@mui/material/colors';
import useRouter from '../providers/RouterProvider';

export default function Terminal() {
  const { page } = useRouter();

  return (
    <Container
      maxWidth={false}
      disableGutters={true}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Grid container spacing={0} sx={{ flex: 1 }}>
        <Grid
          item
          xs={4}
          sx={{
            zIndex: 2,
            backgroundColor: blueGrey[50],
            boxShadow: 3,
            borderRight: `1px solid ${blueGrey}`,

            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Navbar />

          <Box sx={{ p: 2 }}>
            <ConversationList />
          </Box>
        </Grid>

        <Grid
          item
          xs={8}
          sx={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100vh',
          }}
        >
          <MainPanel />
        </Grid>
      </Grid>

      <Box
        sx={{
          p: 2,
          zIndex: 10,
          boxShadow: 10,

          bgcolor: blueGrey[800],
        }}
      >
        This is the footer controls
      </Box>

      {/* create chat dialog */}
      <NewConversationDialog />
    </Container>
  );
}
