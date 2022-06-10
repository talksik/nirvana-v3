import { Grid } from '@mui/material';
import React from 'react';

export default function Terminal() {
  return (
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
  );
}
