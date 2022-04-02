import {
  Button,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

import { $newConvoPage } from "../../../controller/recoil";
import { Search } from "@mui/icons-material";
import renderUserRow from "../../../components/User/basicUserDetailsRow";
import { useSetRecoilState } from "recoil";
import { useUserSearch } from "../../../controller/index";

export default function NewConvo() {
  const setNewPageConvo = useSetRecoilState($newConvoPage);
  const [userSearchQuery, setuserSearchQuery] = useState<string>("");
  const [debUserSearchQ, setDebUserSearchQ] = useState<string>("");

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

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <Button onClick={handleGoBack} size="small">
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

      {isSearching ? <span>loading</span> : <></>}

      {/* search results list */}
      <div className="flex flex-col">
        {data?.users?.map((user) => renderUserRow(user))}
      </div>
    </div>
  );
}
