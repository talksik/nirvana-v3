import { $authTokens, $searchQuery } from "./recoil";
import axios, { AxiosResponse } from "axios";
import { useMutation, useQuery } from "react-query";

import SearchResponse from "@nirvana/core/responses/search.response";
import { User } from "@nirvana/core/models";
import { nirvanaApi } from "./nirvanaApi";
import { queryClient } from "../nirvanaApp";
import { useRecoilValue } from "recoil";

// =========== API
export const localHost = "http://localhost:5000/api";

const getUserDetails = async (
  accessToken: string,
  idToken: string
): Promise<AxiosResponse<User, any>> => {
  return await axios.get(localHost + `/users?access_token=${accessToken}`, {
    headers: { Authorization: idToken },
  });
};

const search = async (
  idToken: string,
  searchQuery: string
): Promise<AxiosResponse<SearchResponse, any>> => {
  return await axios.get<SearchResponse>(
    localHost + `/search?query=${searchQuery}`,
    {
      headers: { Authorization: idToken },
    }
  );
};

// ====== QUERIES
export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
  GET_SEARCH_RESULTS = "GET_SEARCH_RESULTS",
}
export function useGetUserDetails() {
  const authTokens = useRecoilValue($authTokens);

  return useQuery(
    Querytypes.GET_USER_DETAILS,
    () => getUserDetails(authTokens?.accessToken, authTokens?.idToken),
    {
      retry: false,
    }
  );
}

export function useSearch() {
  const authTokens = useRecoilValue($authTokens);
  const searchQuery = useRecoilValue($searchQuery);

  return useQuery(
    Querytypes.GET_SEARCH_RESULTS,
    () => search(authTokens.idToken, searchQuery),
    { enabled: searchQuery ? true : false }
  );
}

// =========== MUTATIONS
export function useCreateUser() {
  return useMutation(nirvanaApi.user.createUser, {
    onSettled: (data, error) => {
      return queryClient.invalidateQueries(Querytypes.GET_USER_DETAILS);
    },
  });
}
