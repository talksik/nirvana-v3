import { Container, Grid } from '@mui/material';

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
        background: blueGrey[50],
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={4}>
          This is the sidepanel
        </Grid>

        <Grid item xs={8}>
          {' '}
          main panel
        </Grid>

        <Grid item xs={12}>
          This is the footer controls
        </Grid>
      </Grid>
    </Container>
  );
}
