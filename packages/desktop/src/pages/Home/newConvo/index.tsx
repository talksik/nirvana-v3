import {
  Button,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import { Check, Search } from "@mui/icons-material";
import {
  useCreateConvo,
  useGetDmByUserId,
  useGetUserDetails,
  useUserSearch,
} from "../../../controller/index";
import { useEffect, useState } from "react";

import { $newConvoPage } from "../../../controller/recoil";
import { ApiCalls } from "../../../controller/nirvanaApi";
import { User } from "@nirvana/core/models/user.model";
import UserRow from "../../../components/User/basicUserDetailsRow";
import toast from "react-hot-toast";
import { useSetRecoilState } from "recoil";

export default function NewConvo() {
  const setNewPageConvo = useSetRecoilState($newConvoPage);
  const [userSearchQuery, setuserSearchQuery] = useState<string>("");
  const [debUserSearchQ, setDebUserSearchQ] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: userDetails } = useGetUserDetails();

  const {
    data,
    isLoading: isSearching,
    isError,
    refetch,
  } = useUserSearch(debUserSearchQ);

  const [debTimeout, setdebTimeout] = useState<any>();

  // trigger the react query to refetch once our deb/"final" search query is set
  useEffect(() => {
    if (debUserSearchQ) refetch();
  }, [debUserSearchQ]);

  const handleGoBack = () => {
    setNewPageConvo(false);
  };

  const triggerSearch = (searchQ: string) => {
    // update search query now and

    setDebUserSearchQ(searchQ);
  };

  const handleUpdateSearchInput = (event: any) => {
    const newSearchQuery = event.target.value;

    // wait 2 seconds to hit api
    const currInitInterval = setTimeout(() => {
      console.log("triggering debounced search");

      triggerSearch(newSearchQuery);
    }, 1000);

    // clear previous interval now that there is a new search entry
    // preventing the last interval from triggering a search
    setdebTimeout((prevTimeout: any) => {
      clearTimeout(prevTimeout);
      return currInitInterval;
    });

    // update the view showing that the user's input is visibly changing input
    setuserSearchQuery(newSearchQuery);
  };

  // select or unselect
  const selectOrUnselectUser = (user: User) => {
    // remove from list/unselect
    if (
      selectedUsers.find(
        (selectedUser) => selectedUser.googleId === user.googleId
      )
    ) {
      console.log("unselecting user");
      setSelectedUsers((prevUsers) =>
        prevUsers.filter(
          (prevUser) => prevUser._id.toString() !== user._id.toString()
        )
      );

      return;
    }

    console.log("selecting user");

    // add to the list of selected
    setSelectedUsers((prevUsers) => [...prevUsers, user]);
  };

  let nonSelectedUsers = [] as User[];
  // remove the user from the list of search results
  if (data?.users) {
    nonSelectedUsers = data?.users.filter(
      (user) =>
        !selectedUsers.find(
          (selectedUser) => selectedUser._id.toString() === user._id.toString()
        )
    );
  }

  const { mutateAsync } = useGetDmByUserId();
  const { mutateAsync: createConvoMutateAsync } = useCreateConvo();

  const createConvo = async () => {
    if (!selectedUsers?.length) {
      toast.error("Must select at least one person");

      return;
    }

    // consolidate the user Ids into an array
    // make sure that there are no duplicates
    const otherMemberIds = selectedUsers.map((selUser) =>
      selUser._id.toString()
    );

    // IF it's a one on one chat
    // check backend with one route if there is an existing conversation
    if (selectedUsers?.length === 1) {
      let existingConvoRes;
      try {
        existingConvoRes = await mutateAsync(selectedUsers[0]._id.toString());

        console.log("there is an existing convo!");
        if (existingConvoRes) {
          toast.error("already have a convo with this person");
          console.log(existingConvoRes);

          return;
        }
      } catch (error) {
        console.error(error);
      } finally {
        console.log("done");
      }
    }

    // create a conversation object in db with convoMembers
    try {
      const createConvoRes = await createConvoMutateAsync(otherMemberIds);

      toast.success("Successfully create conversation");
    } catch (error) {
      console.error(error);
    } finally {
      console.log("done creating convo");
    }

    // broadcast this to right sockets either here or serverside after convo creation
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <Button
          onClick={handleGoBack}
          size="small"
          style={{ textTransform: "none" }}
        >
          back
        </Button>

        <TextField
          value={userSearchQuery}
          autoFocus
          color="secondary"
          label="Search by name or email"
          variant="filled"
          fullWidth
          onChange={handleUpdateSearchInput}
        />
      </div>

      <span className="mx-auto">{data?.users.length ?? 0} results</span>

      {isSearching ? <span className="mx-auto">loading</span> : <></>}

      {/* selected people  */}
      {selectedUsers?.map((user) => (
        <div onClick={() => selectOrUnselectUser(user)}>
          <UserRow user={user} rightJsx={<Check />} />
        </div>
      ))}

      {/* search results list */}
      <div className="flex flex-col">
        {nonSelectedUsers?.map((user) => (
          <div onClick={() => selectOrUnselectUser(user)}>
            <UserRow user={user} />
          </div>
        ))}
      </div>

      <div className="ml-auto">
        <Button variant="contained" onClick={createConvo}>
          Connect
        </Button>
      </div>
    </div>
  );
}
