import { CircularProgress, IconButton, Input, Stack, Tooltip } from '@mui/material';
import { FiSearch, FiUsers } from 'react-icons/fi';
import React, { useCallback, useRef, useState } from 'react';
import { useKeyPressEvent, useRendersCount } from 'react-use';

import KeyboardShortcutLabel from '../subcomponents/KeyboardShortcutLabel';
import { KeyboardShortcuts } from '../util/keyboard';
import NirvanaLogo from '../subcomponents/NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import useRouter from '../providers/RouterProvider';
import useSearch from '../providers/SearchProvider';
import useTerminal from './Terminal';

const Navbar = () => {
  const { handleSetPage } = useRouter();
  const { searchQuery, omniSearch, conversationResults, userResults, isSearching } = useSearch();

  const searchRef = useRef<HTMLInputElement>(null);
  const onSearchFocus = useCallback(() => {
    if (searchRef?.current) searchRef.current.focus();
  }, [searchRef]);

  useKeyPressEvent(KeyboardShortcuts.search.shortcutKey, onSearchFocus);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      omniSearch(e.target.value);
    },
    [omniSearch],
  );

  const rendersCount = useRendersCount();
  // console.warn('RENDER COUNT | NAVBAR | ', rendersCount);

  return (
    <Stack
      direction="row"
      justifyContent={'flex-start'}
      alignItems={'center'}
      spacing={2}
      sx={{
        WebkitAppRegion: 'drag',
        cursor: 'pointer',
        p: 2,
      }}
    >
      <NirvanaLogo />

      <Stack
        direction={'row'}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          bgcolor: blueGrey[100],
          opacity: '50%',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          flex: 1,
        }}
        alignItems={'center'}
        spacing={1}
      >
        <FiSearch style={{ color: blueGrey[500] }} />

        <Input
          onChange={handleSearchChange}
          value={searchQuery}
          placeholder={'Find or start a conversation'}
          inputRef={searchRef}
        />

        {isSearching && <CircularProgress size={20} />}

        {searchQuery ? (
          <KeyboardShortcutLabel label={KeyboardShortcuts.escape.label} />
        ) : (
          <KeyboardShortcutLabel label={KeyboardShortcuts.search.label} />
        )}
      </Stack>

      <Tooltip title={'Group conversation'}>
        <IconButton
          color="default"
          size={'small'}
          onClick={handleSetPage('START_NEW_CONVERSATION')}
        >
          <FiUsers />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default Navbar;
