import { useMutation, useQuery } from "react-query";

import { nirvanaApi } from "./nirvanaApi";
import { queryClient } from "../nirvanaApp";

export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
}

export function useGetUserDetails() {
  return useQuery(Querytypes.GET_USER_DETAILS, nirvanaApi.user.getUserDetails, {
    retry: false,
  });
}

export function useCreateUser() {
  return useMutation(nirvanaApi.user.createUser, {
    onSettled: (data, error) => {
      return queryClient.invalidateQueries(Querytypes.GET_USER_DETAILS);
    },
  });
}
