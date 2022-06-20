import { Box, Container, Grid } from '@mui/material';

import { ConversationList } from './ConversationList';
import FooterControls from './FooterControls';
import MainPanel from './MainPanel';
import Navbar from './Navbar';
import NewConversationDialog from './NewConversationDialog';
import OmniSearchResults from './OmniSearchResults';
import React from 'react';
import { blueGrey } from '@mui/material/colors';
import useRouter from '../providers/RouterProvider';
import useSearch from '../providers/SearchProvider';

export default function Terminal() {
  const { page } = useRouter();

  const { searchQuery } = useSearch();

  return (
    <Container
      maxWidth={false}
      disableGutters={true}
      sx={{
        display: 'flex',
        flexDirection: 'row',
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

          <Box sx={{ p: 2 }}>{searchQuery ? <OmniSearchResults /> : <ConversationList />}</Box>
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

      <FooterControls />

      {/* create chat dialog */}
      <NewConversationDialog />
    </Container>
  );
}
