import { Avatar, Modal } from "antd";
import { HotKeys, KeyMap } from "react-hotkeys";
import { useCallback, useState } from "react";

import BasicUserRow from "../../../components/User/basicUserDetailsRow";
import { FiSearch } from "react-icons/fi";
import { User } from "@nirvana/core/models";
import { useUserSearch } from "../../../controller/index";

export default function NewLineModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const [selectedPeople, setSelectedPeople] = useState<User[]>([]);

  const [peopleSearchValue, setPeopleSearchValue] = useState<string>("");

  // the actual state that goes to query...the debounced one so to speak
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { refetch, data: searchRes } = useUserSearch(searchQuery);

  const handleSubmit = () => {
    // ensure that we don't have a one on one chat already with x person if it's one person selected

    // upon success,
    // make sure that the list of lines updates for this client and others so that it shows this new line
    // select the line so that it shows up in the line details for this client

    // handle close once the new line is created
    handleClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  const onSearch = useCallback(() => {
    if (peopleSearchValue) {
      console.log("searching for people in database");
      setSearchQuery(peopleSearchValue);
    }
  }, [setSearchQuery]);

  const selectUser = useCallback(
    (userToAdd: User) => {
      setSelectedPeople((prevSelectedUsers) => [
        ...prevSelectedUsers,
        userToAdd,
      ]);
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

  const keyMap: KeyMap = {
    HANDLE_SEARCH: {
      name: "handle search on enter",
      sequence: "enter",
      action: "keypress",
    },
  };
  const handlers = {
    HANDLE_SEARCH: onSearch,
  };

  return (
    <>
      <Modal
        title="Create a Line"
        visible={open}
        onCancel={handleCancel}
        footer={
          <div className="flex flex-row text-white">
            <button
              className="flex-1 bg-gray-500 pb-3 pt-2 text-left pl-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-teal-500 pb-3 pt-2 text-left pl-2"
              onClick={handleSubmit}
            >
              Connect
            </button>
          </div>
        }
        className={"flex flex-col gap-5"}
      >
        <HotKeys handlers={handlers} keyMap={keyMap} />

        <div className="flex flex-col items-start gap-2 mb-5">
          <p className="text-gray-300 text-sm">People</p>

          <span className="flex flex-row gap-1 w-full items-center border border-gray-200 p-2 shadow">
            <FiSearch className="text-gray-300" />

            <input
              className="placeholder:text-gray-300 outline-none placeholder:text-sm border-0 flex-1"
              value={peopleSearchValue}
              onChange={(e) => setPeopleSearchValue(e.target.value)}
              placeholder="search by name or email"
            />

            <span className="text-xs text-gray-200">enter to search</span>
          </span>

          {/* search results */}
          <div className="flex flex-col border border-gray-200 shadow-md max-h-[500px] w-full overflow-y-auto">
            {searchRes?.users?.map((user) => (
              <BasicUserRow
                user={user}
                rightJsx={<button onClick={() => selectUser(user)}>Add</button>}
              />
            ))}
          </div>
        </div>

        {/* selected people */}
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-gray-300 text-sm">Selected People</p>

          <div className="flex flex-col w-full">
            {selectedPeople.map((selectedUser) => (
              <BasicUserRow
                user={selectedUser}
                rightJsx={
                  <button
                    onClick={() => unSelectUser(selectedUser._id.toString())}
                  >
                    Remove
                  </button>
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-gray-300 text-sm">Line Name (optional)</p>
          <input
            className="placeholder:text-gray-300 outline-none placeholder:text-sm flex-1 
          border p-2 border-gray-200"
            placeholder={"ex. Engineering, Sprint 7, Follow up on present..."}
          />
        </div>
      </Modal>
    </>
  );
}
