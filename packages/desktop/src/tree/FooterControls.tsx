import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemIcon,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FiActivity,
  FiAirplay,
  FiChevronDown,
  FiHeadphones,
  FiHelpCircle,
  FiLink,
  FiLogOut,
  FiSun,
  FiVideoOff,
  FiX,
} from 'react-icons/fi';
import React, { useCallback, useState } from 'react';

import ConversationLabel from '../subcomponents/ConversationLabel';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import useSearch from '../providers/SearchProvider';
import useZen from '../providers/ZenProvider';

export default function FooterControls() {
  const { handleFlowState } = useZen();

  const { selectedConversation } = useConversations();
  const { user, handleLogout } = useAuth();

  const [openUserSettings, setOpenUserSettings] = useState<boolean>(false);

  const handleClickProfile = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setOpenUserSettings(true);
    },
    [setOpenUserSettings],
  );

  const handleCloseUserSettings = useCallback(() => {
    setOpenUserSettings(false);
  }, [setOpenUserSettings]);

  return (
    <Box
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderTopColor: blueGrey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',

        zIndex: 10,
        boxShadow: 10,

        bgcolor: blueGrey[800],
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        sx={{
          color: 'GrayText',
          p: 1,
          flex: 1,
        }}
      >
        <Stack spacing={1} direction={'row'} alignItems={'center'}>
          <IconButton
            onClick={handleClickProfile}
            size="small"
            sx={{ borderRadius: 1 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar alt={user.givenName} src={user.picture} />
          </IconButton>

          <Tooltip title="Sound configuration">
            <IconButton
              sx={{
                color: 'white',
              }}
              size="small"
            >
              <FiHeadphones />
            </IconButton>
          </Tooltip>

          <Tooltip title={'overlay mode'}>
            <Switch color="secondary" size="small" />
          </Tooltip>

          <Button size={'small'} color={'secondary'} variant="text" onClick={handleFlowState}>
            flow
          </Button>
        </Stack>

        {selectedConversation && (
          <>
            <Stack
              direction={'row'}
              sx={{
                flex: 1,
                mx: 'auto',

                WebkitAppRegion: 'drag',
                cursor: 'pointer',
              }}
              alignItems={'center'}
              justifyContent={'center'}
              spacing={1}
            >
              <Container
                maxWidth={'sm'}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <IconButton color="primary" size="small">
                  <FiSun />
                </IconButton>

                <ConversationLabel
                  users={selectedConversation.members ?? []}
                  conversationName={selectedConversation.name}
                  isSelected={true}
                />
              </Container>
            </Stack>

            <Stack sx={{ ml: 'auto' }} direction={'row'} spacing={1}>
              <AvatarGroup variant={'rounded'}>
                {selectedConversation.members?.map((conversationUser, index) => (
                  <Avatar
                    key={`${selectedConversation._id.toString()}-${conversationUser._id.toString()}-convoIcon`}
                    alt={conversationUser?.givenName}
                    src={conversationUser?.picture}
                    sx={{
                      opacity: selectedConversation.tunedInUsers?.includes(
                        conversationUser._id.toString(),
                      )
                        ? '100%'
                        : '20%',
                    }}
                  />
                ))}
              </AvatarGroup>

              <Tooltip title="Mark priority or not!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiActivity />
                </IconButton>
              </Tooltip>

              <Tooltip title="Paste image or link!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiLink />
                </IconButton>
              </Tooltip>

              <Tooltip title="Show screen!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiAirplay />
                </IconButton>
              </Tooltip>

              <Tooltip title="Show video!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiVideoOff />
                </IconButton>
              </Tooltip>

              {/* todo: not speaking mode, speaking mode, locked in mode */}
              <Tooltip title="Speak or toggle by clicking here!">
                <IconButton
                  sx={{
                    color: 'white',
                  }}
                  size="small"
                >
                  <FiSun />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
        )}
      </Stack>

      <UserSettingsDialog open={openUserSettings} handleClose={handleCloseUserSettings} />
    </Box>
  );
}

function UserSettingsDialog({ open, handleClose }: { handleClose: () => void; open: boolean }) {
  const { user, handleLogout } = useAuth();

  const { omniSearch } = useSearch();
  const handleQuickDialSupport = useCallback(() => {
    omniSearch(SUPPORT_DISPLAY_NAME);
    handleClose();
  }, [omniSearch, handleClose]);

  return (
    <Dialog maxWidth={'sm'} open={open} fullWidth onClose={handleClose}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: blueGrey[50],
          position: 'relative',
        }}
      >
        <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={handleClose}>
          <FiX />
        </IconButton>

        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 10,
            gap: 2,
          }}
        >
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <Typography variant="h6">Media Settings</Typography>

            <Button variant={'text'} color={'secondary'}>
              Unplug everything
            </Button>
          </Stack>

          <FormControl fullWidth>
            <InputLabel>Microphone</InputLabel>
            <Select value={'Macbook Pro High Definition'} label="Microphone">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={'Macbook Pro High Definition'}>
                {'Macbook Pro High Definition'}
              </MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
            <FormHelperText>
              Your speaker selection should be done on your computer status or taskbar. Please
              select distinct speaker and microphone to avoid distortion when you have a bluetooth
              device connected.
            </FormHelperText>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Video</InputLabel>
            <Select value={'HD Macbook Pro'} label="Audio">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={'HD Macbook Pro'}>{'HD Macbook Pro'}</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth disabled>
            <InputLabel>Screen</InputLabel>
            <Select value={'Chrome browser - stack overflow'} label="Audio">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={'Chrome browser - stack overflow'}>
                {'Chrome browser - stack overflow'}
              </MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="subtitle2">Questions?</Typography>

            <Button variant={'text'}>Resources</Button>
          </Stack>

          <Divider />

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="subtitle2">Help, feedback, and more?</Typography>

            <Button variant={'text'} onClick={handleQuickDialSupport}>
              Contact Us
            </Button>
          </Stack>

          <Divider />

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="subtitle2">Account</Typography>

            <Button variant={'text'} onClick={handleLogout} color={'error'}>
              log out
            </Button>
          </Stack>
        </Container>
      </Container>
    </Dialog>
  );
}
