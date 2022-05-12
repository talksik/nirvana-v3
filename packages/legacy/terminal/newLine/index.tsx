import { Avatar, Modal } from 'antd';
import { HotKeys, KeyMap } from 'react-hotkeys';
import { useCallback, useEffect, useState } from 'react';
import { useCreateLine, useUserSearch } from '../../../src/controller/index';

import BasicUserRow from '../../components/User/basicUserDetailsRow';
import { FiSearch } from 'react-icons/fi';
import { User } from '@nirvana/core/models';
import toast from 'react-hot-toast';

export default function NewLineModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const [selectedPeople, setSelectedPeople] = useState<User[]>([]);

  const [peopleSearchValue, setPeopleSearchValue] = useState<string>('');

  // the actual state that goes to query...the debounced one so to speak
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { refetch, data: searchRes } = useUserSearch(searchQuery);

  const { mutateAsync, isLoading } = useCreateLine();

  const [lineName, setLineName] = useState<string>('');

  useEffect(() => {
    if (searchQuery) refetch();
  }, [searchQuery]);

  const onSearch = useCallback(() => {
    console.log('enter key pressed');

    if (peopleSearchValue) {
      console.log('searching for people in database');
      setSearchQuery(peopleSearchValue);
    }
  }, [setSearchQuery, peopleSearchValue]);

  const selectUser = useCallback(
    (userToAdd: User) => {
      setSelectedPeople((prevSelectedUsers) => {
        // if user is not already in the selected user
        const foundUser = prevSelectedUsers.find(
          (currentUser) =>
            currentUser._id.toString() === userToAdd._id.toString()
        );
        if (!foundUser) {
          return [...prevSelectedUsers, userToAdd];
        }

        toast.error('you already selected this person below!');
        return prevSelectedUsers;
      });
    },
    [setSelectedPeople]
  );

  const unSelectUser = useCallback(
    (userIdToRemove: string) => {
      setSelectedPeople((prevSelectedUsers) => {
        return prevSelectedUsers.filter(
          (prevUser) => prevUser._id.toString() !== userIdToRemove
        );
      });
    },
    [setSelectedPeople]
  );

  const handleSubmit = useCallback(async () => {
    // TODO: prevent creating one-on-one line if already exists with x person?
    // ensure that we don't have a one on one chat already with x person if it's one person selected

    // upon success,
    // make sure that the list of lines updates for this client and others so that it shows this new line
    // select the line so that it shows up in the line details for this client

    console.log('trying to create line now!');

    try {
      if (!selectedPeople?.length) {
        toast.error('you must select at least one person');
        return;
      }

      const selectedMemberIds = selectedPeople.map((selectedPerson) =>
        selectedPerson._id.toString()
      );

      const res = await mutateAsync({
        lineName,
        otherMemberIds: selectedMemberIds,
      });

      toast.success('created line!');

      // handle close once the new line is created
      handleClose();
    } catch (error) {
      toast.error(error);
      console.error(error);
    } finally {
      console.log('done');
    }
  }, [lineName, selectedPeople]);

  const handleCancel = () => {
    handleClose();
  };

  const keyMap: KeyMap = {
    HANDLE_SEARCH: 'enter',
  };
  const handlers = {
    HANDLE_SEARCH: onSearch,
  };

  if (isLoading) return <span>one second while we make magic</span>;

  return (
    <>
      <Modal
        title='Create a Line'
        visible={open}
        onCancel={handleCancel}
        footer={
          <div className='flex flex-row text-white'>
            <button
              className='flex-1 bg-gray-500 pb-3 pt-2 text-left pl-2'
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className='flex-1 bg-teal-500 pb-3 pt-2 text-left pl-2'
              onClick={handleSubmit}
            >
              Connect
            </button>
          </div>
        }
        className={'flex flex-col gap-5'}
      >
        <HotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
          <div className='flex flex-col items-start gap-2 mb-5'>
            <p className='text-gray-300 text-sm'>People</p>

            <span className='flex flex-row gap-1 w-full items-center border border-gray-200 p-2 shadow'>
              <FiSearch className='text-gray-300' />

              <input
                className='placeholder:text-gray-300 outline-none placeholder:text-sm border-0 flex-1'
                value={peopleSearchValue}
                onChange={(e) => setPeopleSearchValue(e.target.value)}
                placeholder='search by name or email'
              />

              <span className='text-xs text-gray-200 ml-auto'>
                enter to search
              </span>
            </span>

            {/* search results */}
            {searchRes?.users?.length > 0 && (
              <div className='flex flex-col border border-gray-200 shadow-md max-h-[500px] w-full overflow-y-auto'>
                {searchRes?.users?.map((searchedUser) => (
                  <BasicUserRow
                    key={`searchResUser-${searchedUser.googleId}`}
                    user={searchedUser}
                    rightJsx={
                      <button onClick={() => selectUser(searchedUser)}>
                        Add
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* selected people */}
          {selectedPeople?.length > 0 && (
            <div className='flex flex-col gap-2 mb-5'>
              <p className='text-gray-300 text-sm'>Selected People</p>

              <div className='flex flex-col w-full'>
                {selectedPeople.map((selectedUser) => (
                  <BasicUserRow
                    key={`selectedUser-${selectedUser.googleId}`}
                    user={selectedUser}
                    rightJsx={
                      <button
                        onClick={() =>
                          unSelectUser(selectedUser._id.toString())
                        }
                      >
                        Remove
                      </button>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <p className='text-gray-300 text-sm'>Line Name (optional)</p>
            <input
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              className='placeholder:text-gray-300 outline-none placeholder:text-sm flex-1 
          border p-2 border-gray-200'
              placeholder={'ex. Engineering, Sprint 7, Follow up on present...'}
            />
          </div>
        </HotKeys>
      </Modal>
    </>
  );
}
