import { $searchQuery } from "../../../controller/recoil";
import { useEffect } from "react";
import { useSearch } from "../../../controller";

export default function Search() {
  const { data: searchResultsResponse, isLoading, isError } = useSearch();
  useEffect(() => {}, []);

  if (!searchResultsResponse?.users) {
    return (
      <span className="text-white">
        no results. please try someone's email or name.
      </span>
    );
  }

  return (
    <div>
      {searchResultsResponse.users?.map((user) => {
        return <span>{user.name}</span>;
      })}
    </div>
  );
}
