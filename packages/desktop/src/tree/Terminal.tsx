import { Box, Container, Grid } from '@mui/material';

import Navbar from './Navbar';
import React from 'react';
import { blueGrey } from '@mui/material/colors';

export default function Terminal() {
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
        </Grid>

        <Grid item xs={8} sx={{ bgcolor: 'white' }}>
          main panel
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
    </Container>
  );
}
