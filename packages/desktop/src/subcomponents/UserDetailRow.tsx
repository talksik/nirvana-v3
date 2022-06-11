import { Avatar, Box, Stack, Typography } from '@mui/material';

import React from 'react';
import User from '@nirvana/core/models/user.model';

export default function UserDetailRow({
  user,
  rightContent,
}: {
  user: User;
  rightContent?: React.ReactNode;
}) {
  return (
    <Stack
      direction={'row'}
      alignItems="center"
      spacing={1}
      sx={{
        px: 1,
      }}
    >
      <Avatar src={user.picture} alt={user.givenName} />

      <Stack>
        <Typography variant="subtitle2" color="info" gutterBottom={false}>
          {user.name}
        </Typography>
        <Typography variant={'overline'}>{user.email}</Typography>
      </Stack>

      <Box
        sx={{
          ml: 'auto',
        }}
      >
        {rightContent}
      </Box>
    </Stack>
  );
}
