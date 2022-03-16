import { useMutation, useQuery } from "react-query";

import axios from "axios";

export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
}

export const localHost = process.env.REACT_APP_API_DOMAIN;

export function useGetUserDetails() {
  return useQuery(Querytypes.GET_USER_DETAILS, () =>
    axios({
      method: "GET",
      url: localHost + `/users`,
      headers: { Authorization: "fake_id_token" },
    })
  );
}
