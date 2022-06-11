import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteRenderOptionState,
  Button,
  Container,
  Dialog,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  ListItem,
  Select,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { useDebounce, useKeyPressEvent, useToggle } from 'react-use';

import CircularProgress from '@mui/material/CircularProgress';
import { FiX } from 'react-icons/fi';
import { NirvanaRules } from '../util/rules';
import User from '@nirvana/core/models/user.model';
import UserDetailRow from '../subcomponents/UserDetailRow';
import { blueGrey } from '@mui/material/colors';
import toast from 'react-hot-toast';
import useAuth from '../providers/AuthProvider';
import useRouter from '../providers/RouterProvider';
import useSearch from '../providers/SearchProvider';

export default function NewConversationDialog() {
  const { page, handleSetPage } = useRouter();

  const { user } = useAuth();

  const { userResults, searchQuery, searchUsers, isSearching } = useSearch();

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleChangeSelections = useCallback(
    (e: React.SyntheticEvent<Element, Event>, value: User[], reason: AutocompleteChangeReason) => {
      setSelectedUsers(value);
    },
    [],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
      searchUsers(newValue);
    },
    [searchUsers],
  );

  const renderOption = useCallback(
    (props: HTMLAttributes<HTMLLIElement>, option: User, state: AutocompleteRenderOptionState) => (
      <ListItem {...props}>
        <UserDetailRow user={option} />
      </ListItem>
    ),
    [],
  );

  const [conversationName, setConversationName] = useState<string>('');

  useEffect(() => {
    if (selectedUsers.length < 2) {
      setConversationName('');
    }
  }, [selectedUsers, setConversationName]);

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConversationName(e.target.value);
    },
    [setConversationName],
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    if (selectedUsers.length === 0) {
      toast.error('Must select a person!');
      return;
    }

    if (selectedUsers.length + 1 >= NirvanaRules.maxMembersPerConversation) {
      toast.error('A group can only have 8 people including you!');
      return;
    }

    setIsSubmitting(true);

    // await handleSubmit(selectedUsers, conversationName);
    toast('submitting');

    // clear form for next time
    setSelectedUsers([]);
    setConversationName('');

    setIsSubmitting(false);
  }, [selectedUsers, setConversationName, conversationName, setSelectedUsers, setIsSubmitting]);

  return (
    <Dialog fullScreen open={page === 'START_NEW_CONVERSATION'} onClose={handleSetPage('WELCOME')}>
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
        <IconButton
          sx={{ position: 'absolute', top: 10, right: 10 }}
          onClick={handleSetPage('WELCOME')}
        >
          <FiX />
        </IconButton>

        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <Typography variant="h4">Start a Conversation</Typography>

          <Autocomplete
            multiple
            loading={isSearching}
            includeInputInList
            id="tags-outlined"
            autoHighlight
            onInputChange={handleChangeSearchInput}
            options={userResults}
            renderOption={renderOption}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            value={selectedUsers}
            onChange={handleChangeSelections}
            filterSelectedOptions
            isOptionEqualToValue={(optionUser, valueUser) =>
              optionUser._id.toString() === valueUser._id.toString()
            }
            filterOptions={(options) => options}
            inputValue={searchQuery}
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                fullWidth
                label="People"
                {...params}
                placeholder="Search by name or email"
              />
            )}
          />

          {selectedUsers.length > 1 && (
            <TextField
              value={conversationName}
              onChange={handleChangeName}
              fullWidth
              label="Name (optional)"
              placeholder="Channel, subject line, whatever..."
            />
          )}

          <Stack justifyContent={'flex-end'} direction={'row'} spacing={2}>
            <Button onClick={handleSetPage('WELCOME')} variant={'text'}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0 || isSubmitting}
              variant={'contained'}
              color="primary"
            >
              {isSubmitting ? <CircularProgress /> : 'Connect'}
            </Button>
          </Stack>
        </Container>
      </Container>
    </Dialog>
  );
}
