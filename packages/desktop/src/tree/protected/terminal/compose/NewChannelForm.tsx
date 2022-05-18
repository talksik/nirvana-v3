import React, { useState, useCallback } from 'react';
import { FiUsers, FiXSquare } from 'react-icons/fi';
import { useAsyncFn, useDebounce } from 'react-use';
import { userSearch } from '../../../../api/NirvanaApi';
import toast from 'react-hot-toast';
import { Avatar, Skeleton } from 'antd';
import { User } from '@nirvana/core/models/user.model';

export default function NewChannelForm() {
  const [peopleSearchQuery, setPeopleSearchQuery] = useState<string>('');

  const [userSearchRes, fetchUsers] = useAsyncFn(userSearch);

  const [isReady, cancel] = useDebounce(
    async () => {
      try {
        await fetchUsers(peopleSearchQuery);
      } catch (error) {
        toast.error('Problem in searching users!');
        console.error(error);
      }
    },
    2000,
    [peopleSearchQuery],
  );

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const addUser = useCallback(
    (newUser: User) => {
      setSelectedUsers((prevUsers) => [...prevUsers, newUser]);
    },
    [setSelectedUsers],
  );

  const removeUser = useCallback((userIdToRemove: string) => {
    setSelectedUsers((prevUsers) =>
      prevUsers.filter((currentUser) => !currentUser._id.equals(userIdToRemove)),
    );
  }, []);

  const handleSearchChange = useCallback(
    async (e) => {
      setPeopleSearchQuery(e.target.value);
    },
    [setPeopleSearchQuery],
  );

  return (
    <div className="flex flex-col flex-1 items-center pt-10 bg-white">
      <div className="flex flex-col gap-2 max-w-lg w-full">
        {/* people search */}
        <span className="text-gray-500">People</span>
        <div
          className="flex flex-row items-center space-x-2 bg-transparent
bg-gray-200 p-3 rounded"
        >
          <FiUsers className="text-lg text-gray-400" />
          <input
            placeholder="Search by name or email"
            className="flex-1 text-lg bg-transparent placeholder-gray-300 focus:outline-none"
            onChange={handleSearchChange}
            value={peopleSearchQuery}
          />
        </div>

        {/* dropdown search results */}
        <div className="flex flex-col shadow-lg max-h-[500px] overflow-auto">
          {(userSearchRes.loading || !isReady) && <Skeleton />}

          {userSearchRes.value?.users.map((searchedUser) => {
            return (
              <div
                onClick={() => addUser(searchedUser)}
                role={'presentation'}
                key={searchedUser.email}
                className="flex flex-row gap-2 items-center p-2 border border-gray-200
    hover:bg-gray-200 cursor-pointer"
              >
                <Avatar src={searchedUser.picture} size={'large'} shape={'square'} />
                <span className="flex flex-col gap-1">
                  <span className="text-md font-semibold text-gray-600">{searchedUser.name}</span>
                  <span className="text-sm text-gray-400">{searchedUser.email}</span>
                </span>
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
    hover:bg-gray-200 cursor-pointer group"
            >
              <Avatar src={selectedUser.picture} size={'large'} shape={'square'} />
              <span className="flex flex-col gap-1">
                <span className="text-md font-semibold text-gray-600">{selectedUser.name}</span>
                <span className="text-sm text-gray-400">{selectedUser.email}</span>
              </span>

              <FiXSquare className="ml-auto text-gray-400 cursor-pointer group-hover:scale-105" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
