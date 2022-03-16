import { useMutation, useQuery } from "react-query";

import axios from "axios";
import { nirvanaApi } from "./nirvanaApi";

export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
}

export function useGetUserDetails() {
  return useQuery(Querytypes.GET_USER_DETAILS, nirvanaApi.getUserDetails, {
    retry: true,
  });
}
