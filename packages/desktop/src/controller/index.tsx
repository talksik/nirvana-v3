import { nirvanaApi } from "./nirvanaApi";
import { useQuery } from "react-query";

export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
}

export function useGetUserDetails() {
  return useQuery(Querytypes.GET_USER_DETAILS, nirvanaApi.getUserDetails, {
    retry: true,
  });
}
