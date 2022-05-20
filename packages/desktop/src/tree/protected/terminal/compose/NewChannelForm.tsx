import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiPlusSquare, FiUsers, FiX, FiXSquare } from 'react-icons/fi';
import { useAsyncFn, useDebounce, useKeyPressEvent } from 'react-use';
import { createLine, userSearch } from '../../../../api/NirvanaApi';
import toast from 'react-hot-toast';
import { Avatar, Divider, Skeleton, Spin } from 'antd';
import { User } from '@nirvana/core/models/user.model';
import CreateLineRequest from '@nirvana/core/requests/createLine.request';
import { maxChannelUserCount } from '../rules';

export default function NewChannelForm({ handleClose }: { handleClose: () => void }) {
  const [peopleSearchQuery, setPeopleSearchQuery] = useState<string>('');

  const [userSearchRes, fetchUsers] = useAsyncFn(userSearch);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [isSearchingUsers, setSearchingUsers] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [createChannelRes, triggerCreateChannel] = useAsyncFn(createLine);

  useEffect(() => {
    if (searchInputRef) searchInputRef.current.focus();
  }, [searchInputRef]);

  const [_, cancel] = useDebounce(
    async () => {
      if (!peopleSearchQuery) {
        return;
      }

      try {
        await fetchUsers(peopleSearchQuery);

        setSearchingUsers(false);
      } catch (error) {
        toast.error('Problem in searching users!');
        console.error(error);
      }
    },
    200,
    [peopleSearchQuery, setSearchingUsers, fetchUsers],
  );

  const handleSearchChange = useCallback(
    async (e) => {
      setSearchingUsers(true);
      setPeopleSearchQuery(e.target.value);
    },
    [setPeopleSearchQuery, setSearchingUsers],
  );

  // ensuring that we haven't already selected this user
  // changing search results so that we don't see the selected user in the search results anymore
  const addUser = useCallback(
    (newUser: User) => {
      setSelectedUsers((prevUsers) => {
        if (prevUsers.find((currUser) => currUser.email === newUser.email)) {
          return prevUsers;
        }

        if (prevUsers.length === maxChannelUserCount - 1) {
          toast.error('you can only have 8 people per channel!');

          return prevUsers;
        }

        return [...prevUsers, newUser];
      });

      if (userSearchRes.value?.users) {
        userSearchRes.value.users = userSearchRes.value.users.filter(
          (currUser) => currUser._id !== newUser._id,
        );
      }
    },
    [setSelectedUsers, userSearchRes.value],
  );

  const removeUser = useCallback((userIdToRemove: string) => {
    setSelectedUsers((prevUsers) =>
      prevUsers.filter((currentUser) => currentUser._id.toString() !== userIdToRemove),
    );
  }, []);

  // TODO: prevent creating one-on-one line if already exists with x person?
  // ensure that we don't have a one on one chat already with x person if it's one person selected

  // upon success,
  // make sure that the list of lines updates for this client and others so that it shows this new line
  // select the line so that it shows up in the line details for this client
  const handleCreateChannel = useCallback(async () => {
    console.log('trying to create line now!');

    try {
      if (!selectedUsers?.length) {
        toast.error('you must select at least one person');
        return;
      }

      if (selectedUsers.length === maxChannelUserCount - 1) {
        toast.error(`Max ${maxChannelUserCount} people per channel including you!`);

        return;
      }

      const selectedMemberIds = selectedUsers.map((selectedPerson) =>
        selectedPerson._id.toString(),
      );

      await triggerCreateChannel(new CreateLineRequest(selectedMemberIds));

      toast.success('created channel!');

      // handle close once the new line is created
      handleClose();
    } catch (error) {
      toast.error(error);
      console.error(error);
    } finally {
      console.log('done');
    }
  }, [handleClose, selectedUsers, triggerCreateChannel]);

  useKeyPressEvent('Enter', handleCreateChannel);
  useKeyPressEvent('Escape', handleClose);

  return (
    <div className="flex flex-col flex-1 items-center pt-10 bg-white relative">
      <span className="flex flex-col items-center gap-2 absolute top-5 right-5 cursor-pointer">
        <FiX onClick={handleClose} className="text-gray-300 text-xl" />
        <span className="text-gray-300 text-xs p-1 bg-gray-100">`esc`</span>
      </span>

      <div className="flex flex-col gap-2 max-w-lg w-full">
        {/* people search */}
        <span className="text-gray-500">People</span>
        <div className="flex flex-row items-center space-x-2 bg-gray-100 p-3 rounded">
          <FiUsers className="text-lg text-gray-400" />
          <input
            ref={searchInputRef}
            placeholder="Search by name or email"
            className="flex-1 text-lg bg-transparent placeholder-gray-300 focus:outline-none"
            onChange={handleSearchChange}
            value={peopleSearchQuery}
          />
        </div>

        {/* dropdown search results */}
        <div className="flex flex-col shadow-lg max-h-[500px] overflow-auto">
          {(userSearchRes.loading || isSearchingUsers) && <Spin />}

          {(!userSearchRes.value || userSearchRes.value?.users.length === 0) &&
            selectedUsers?.length === 0 && (
              <span className="p-10 text-gray-300">{`Can't find someone? Invite them and tell them the secret passcode!`}</span>
            )}
          {userSearchRes.value?.users.map((searchedUser) => {
            return (
              <div
                onClick={() => addUser(searchedUser)}
                role={'presentation'}
                key={searchedUser.email}
                className="flex flex-row gap-2 items-center p-2 border border-gray-200
    hover:bg-gray-100 cursor-pointer"
              >
                <Avatar src={searchedUser.picture} size={'large'} shape={'square'} />
                <span className="flex flex-col gap-1">
                  <span className="text-md font-semibold text-gray-600">{searchedUser.name}</span>
                  <span className="text-sm text-gray-400">{searchedUser.email}</span>
                </span>

                <FiPlusSquare className="ml-auto text-lg text-teal-500 cursor-pointer group-hover:scale-105" />
              </div>
            );
          })}
        </div>

        {/* selected people */}
        <span className="flex flex-row justify-between mt-5">
          <span className="text-gray-500 ">{`Selected`}</span>

          <span className="text-gray-400">
            {selectedUsers.length}/${maxChannelUserCount - 1}
          </span>
        </span>

        {selectedUsers.map((selectedUser) => {
          return (
            <div
              onClick={() => removeUser(selectedUser._id.toString())}
              role={'presentation'}
              key={selectedUser.email}
              className="flex flex-row gap-2 items-center p-2 border border-gray-200
    hover:bg-gray-100 cursor-pointer group"
            >
              <Avatar src={selectedUser.picture} size={'large'} shape={'square'} />
              <span className="flex flex-col gap-1">
                <span className="text-md font-semibold text-gray-600">{selectedUser.name}</span>
                <span className="text-sm text-gray-400">{selectedUser.email}</span>
              </span>

              <FiXSquare className="ml-auto text-lg text-pink-500 cursor-pointer group-hover:scale-105" />
            </div>
          );
        })}

        <Divider />

        <div className="flex flex-row justify-end items-start gap-2">
          <button onClick={handleClose} className="p-2 text-gray-300 hover:bg-gray-100">
            Cancel
          </button>

          <span className="flex flex-col items-center gap-2">
            <button onClick={handleCreateChannel} className="p-2 bg-gray-800 text-white">
              Tune In
            </button>
            <span className="text-gray-300 text-xs p-1 bg-gray-100">`enter`</span>
          </span>
        </div>
      </div>
    </div>
  );
}
