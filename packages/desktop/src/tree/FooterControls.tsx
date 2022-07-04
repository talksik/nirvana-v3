import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiCircle,
  FiRss,
  FiSettings,
  FiSun,
  FiVideo,
  FiVideoOff,
  FiX,
  FiZap,
  FiZapOff,
} from 'react-icons/fi';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ConversationUserMember } from '@nirvana/core/models/conversation.model';
import { MasterConversation } from '../util/types';
import { SUPPORT_DISPLAY_NAME } from '../util/support';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import useConversations from '../providers/ConversationProvider';
import useDevices from '../hooks/useDevices';
import useElectron from '../providers/ElectronProvider';
import useSearch from '../providers/SearchProvider';
import useZen from '../providers/ZenProvider';

export default function FooterControls() {
  const { handleFlowState } = useZen();

  const { selectedConversation, priorityConversations, userLocalStream, handleToggleVideo } =
    useConversations();
  const { user, handleLogout } = useAuth();

  const { handleToggleDesktopMode, desktopMode } = useElectron();

  const [openUserSettings, setOpenUserSettings] = useState<boolean>(false);

  const handleTurnOnFlowState = useCallback(() => {
    // when in overlay mode, we need to toggle main app and then go into flow state

    if (desktopMode === 'overlayOnly') {
      handleToggleDesktopMode();
    }

    handleFlowState();
  }, [handleFlowState, desktopMode, handleToggleDesktopMode]);

  const handleClickProfile = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (desktopMode === 'overlayOnly') {
        handleToggleDesktopMode();
      }

      setOpenUserSettings(true);
    },
    [setOpenUserSettings, handleToggleDesktopMode, desktopMode],
  );

  const handleCloseUserSettings = useCallback(() => {
    setOpenUserSettings(false);
  }, [setOpenUserSettings]);

  // is there a selected conversation and if so, is it a priority one?
  const isSelectedConversationPriority = useMemo(() => {
    const priorityIds =
      priorityConversations.map((priorityConvo) => priorityConvo._id.toString()) ?? [];

    if (selectedConversation && priorityIds.includes(selectedConversation._id.toString())) {
      return true;
    }

    return false;
  }, [selectedConversation, priorityConversations]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (localVideoRef?.current && userLocalStream) {
      localVideoRef.current.srcObject = userLocalStream;
    }
  }, [localVideoRef, userLocalStream]);

  return (
    <Box
      sx={{
        maxWidth: 80,
        width: '100%',
        zIndex: 10,
        boxShadow: 10,

        bgcolor: blueGrey[800],

        display: 'flex',
        flexDirection: 'column',
      }}
      className={'titlebar'}
    >
      <Stack
        direction={'column'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        sx={{
          p: 1,
          flex: 1,
          overflow: 'auto',
        }}
      >
        {priorityConversations.map((masterPriorityConversation) => (
          <OverlayConversation
            key={`priorityConversationOverlay-${masterPriorityConversation._id.toString()}`}
            masterConversation={masterPriorityConversation}
            isSelected={
              masterPriorityConversation._id.toString() === selectedConversation?._id.toString()
            }
          />
        ))}

        {selectedConversation && !isSelectedConversationPriority && (
          <>
            <Divider orientation="horizontal" flexItem />
            <OverlayConversation masterConversation={selectedConversation} isSelected={true} />
          </>
        )}
      </Stack>

      <Stack sx={{ mt: 'auto' }} spacing={1} direction={'column'} alignItems={'center'}>
        <Divider orientation="horizontal" flexItem />

        <Tooltip title="Show video!">
          <IconButton size={'small'} sx={{ color: 'white' }} onClick={handleToggleVideo}>
            {userLocalStream ? <FiVideo /> : <FiVideoOff />}
          </IconButton>
        </Tooltip>

        <Divider orientation="horizontal" flexItem />

        <Button size={'small'} color={'secondary'} variant="text" onClick={handleTurnOnFlowState}>
          flow
        </Button>

        <IconButton
          onClick={handleClickProfile}
          size="small"
          sx={{ borderRadius: 1 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {userLocalStream ? (
            <Box height={40} width={40} ref={localVideoRef} component={'video'} autoPlay muted />
          ) : (
            <Avatar alt={user.givenName} src={user.picture} />
          )}
        </IconButton>

        <Divider orientation="horizontal" flexItem />

        <Tooltip title={desktopMode === 'overlayOnly' ? 'expand' : 'collapse'}>
          <IconButton color={'info'} onClick={handleToggleDesktopMode}>
            {desktopMode === 'overlayOnly' ? <FiChevronsLeft /> : <FiChevronsRight />}
          </IconButton>
        </Tooltip>
      </Stack>

      <UserSettingsDialog open={openUserSettings} handleClose={handleCloseUserSettings} />
    </Box>
  );
}

function OverlayConversation({
  masterConversation,
  isSelected = false,
}: {
  masterConversation: MasterConversation;
  isSelected?: boolean;
}) {
  const { user } = useAuth();

  const { selectConversation, handleEscape, updateConversationPriority, userLocalStream } =
    useConversations();

  const handleSelectConversation = useCallback(() => {
    if (!isSelected) {
      selectConversation(masterConversation._id.toString(), false);
    }
  }, [masterConversation, selectConversation, isSelected]);

  const isPriority = useMemo(() => {
    const personalConvoMember = masterConversation.members.find(
      (mem) => mem._id.toString() === user._id.toString(),
    );
    if (personalConvoMember && personalConvoMember.memberState === 'priority') {
      return true;
    }

    return false;
  }, [masterConversation, user]);

  const handleToggleConversationZap = useCallback(() => {
    if (isPriority) {
      updateConversationPriority(masterConversation._id.toString(), 'inbox');
      return;
    }
    updateConversationPriority(masterConversation._id.toString(), 'priority');
  }, [updateConversationPriority, isPriority, masterConversation._id]);

  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    //
  }, []);

  return (
    <Stack
      direction={'column'}
      spacing={1}
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 2,
        bgcolor: isSelected ? blueGrey[300] : blueGrey[600],
        transition: (theme) =>
          theme.transitions.create(['background-color', 'transform'], {
            duration: theme.transitions.duration.standard,
          }),

        cursor: 'pointer',

        '&:hover': {
          bgcolor: blueGrey[300],
        },
      }}
      onClick={handleSelectConversation}
      alignItems={'center'}
    >
      {/*  status */}
      <Box
        component={'span'}
        sx={{
          bgcolor: (theme) => theme.palette.secondary.main,
          height: 5,
          width: 5,
          borderRadius: 100,
        }}
      />

      <AvatarGroup
        variant={'rounded'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          '& >:first-child': {
            marginTop: 0,
          },
          '& > *': {
            marginLeft: '0 !important' as any,
            marginTop: -2,
          },
        }}
        max={3}
      >
        {masterConversation.members?.map((conversationUserMember, index) => (
          <OverlayConversationAvatar
            key={`${masterConversation._id.toString()}-${conversationUserMember._id.toString()}-overlayConvoAvatar`}
            isTunedIn={masterConversation.tunedInUsers?.includes(
              conversationUserMember._id.toString(),
            )}
            isConversationSelected={isSelected}
            conversationUserMember={conversationUserMember}
          />
        ))}
      </AvatarGroup>

      {isSelected && (
        <>
          <Divider orientation="horizontal" flexItem />

          <Tooltip title={'enter to toggle, ~ to push to talk'}>
            <IconButton color={'primary'} size="small">
              {isPriority ? <FiSun /> : <FiCircle />}
            </IconButton>
          </Tooltip>

          <Divider orientation="horizontal" flexItem />

          <Tooltip title={isPriority ? 'zapped' : 'un-zapped'}>
            <IconButton
              sx={{
                color: 'white',
                fontSize: 15,
              }}
              aria-selected={isPriority ? true : false}
              onClick={handleToggleConversationZap}
            >
              {isPriority ? <FiZap /> : <FiZapOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title="hit escape!">
            <IconButton
              sx={{
                color: 'GrayText',
              }}
              size="small"
              onClick={handleEscape}
            >
              <FiX />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
}

function OverlayConversationAvatar({
  conversationUserMember,
  isTunedIn,
  isConversationSelected,
}: {
  conversationUserMember: ConversationUserMember;
  isTunedIn: boolean;
  isConversationSelected: boolean; // if user is connecting or just have this conversation selected
}) {
  const { userLocalStream } = useConversations();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef?.current && userLocalStream) {
      localVideoRef.current.srcObject = userLocalStream;
    }
  }, [localVideoRef, userLocalStream]);

  if (conversationUserMember._id.toString() === user._id.toString() && userLocalStream) {
    return (
      <Box
        height={40}
        width={40}
        ref={localVideoRef}
        component={'video'}
        autoPlay
        muted
        border={'2px solid #fff'}
      />
    );
  }

  return (
    (conversationUserMember._id.toString() !== user._id.toString() || isConversationSelected) && (
      <Avatar
        alt={conversationUserMember?.givenName}
        src={conversationUserMember?.picture}
        sx={{
          opacity: isTunedIn ? '100%' : '20%',
        }}
      />
    )
  );
  return <></>;
}

const NO_DEVICE_SELECTION = 'NA';

function UserSettingsDialog({ open, handleClose }: { handleClose: () => void; open: boolean }) {
  const { user, handleLogout } = useAuth();
  const devices = useDevices();

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

          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <FormControl fullWidth>
              <InputLabel>Microphone</InputLabel>
              <Select label="Microphone">
                <MenuItem value={NO_DEVICE_SELECTION}>
                  <em>None</em>
                </MenuItem>
                {devices.audioInputDevices.map((deviceInfo) => (
                  <MenuItem
                    key={`micDeviceSelection-${deviceInfo.deviceId}`}
                    value={deviceInfo.deviceId}
                  >
                    {deviceInfo.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Please select distinct speaker and microphone to avoid distortion when you have a
                bluetooth device connected.
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Video</InputLabel>
              <Select label="Audio">
                <MenuItem value={NO_DEVICE_SELECTION}>
                  <em>None</em>
                </MenuItem>
                {devices.videoDevices.map((deviceInfo) => (
                  <MenuItem
                    key={`videoDeviceSelection-${deviceInfo.deviceId}`}
                    value={deviceInfo.deviceId}
                  >
                    {deviceInfo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

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
