import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiPlusSquare, FiUsers, FiXSquare } from 'react-icons/fi';
import { useAsyncFn, useDebounce } from 'react-use';
import { userSearch } from '../../../../api/NirvanaApi';
import toast from 'react-hot-toast';
import { Avatar, Skeleton, Spin } from 'antd';
import { User } from '@nirvana/core/models/user.model';

export default function NewChannelForm() {
  const [peopleSearchQuery, setPeopleSearchQuery] = useState<string>('');

  const [userSearchRes, fetchUsers] = useAsyncFn(userSearch);

  const [isSearchingUsers, setSearchingUsers] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef) searchInputRef.current.focus();
  }, [searchInputRef]);

  const [_, cancel] = useDebounce(
    async () => {
      try {
        await fetchUsers(peopleSearchQuery);

        setSearchingUsers(false);
      } catch (error) {
        toast.error('Problem in searching users!');
        console.error(error);
      }
    },
    1000,
    [peopleSearchQuery, setSearchingUsers, fetchUsers],
  );

  const handleSearchChange = useCallback(
    async (e) => {
      setSearchingUsers(true);
      setPeopleSearchQuery(e.target.value);
    },
    [setPeopleSearchQuery, setSearchingUsers],
  );

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // ensuring that we haven't already selected this user
  // changing search results so that we don't see the selected user in the search results anymore
  const addUser = useCallback(
    (newUser: User) => {
      setSelectedUsers((prevUsers) => {
        if (prevUsers.find((currUser) => currUser.email === newUser.email)) {
          return [...prevUsers, newUser];
        }
        return prevUsers;
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

  return (
    <div className="flex flex-col flex-1 items-center pt-10 bg-white">
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
          {(!userSearchRes.value || userSearchRes.value?.users.length === 0) && (
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

          <span className="text-gray-400">{selectedUsers.length}/7</span>
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
      </div>
    </div>
  );
}
