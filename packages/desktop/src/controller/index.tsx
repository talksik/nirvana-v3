import { useMutation, useQuery } from "react-query";

import { $authTokens } from "./recoil";
import { User } from "@nirvana/core/models";
import axios from "axios";
import { nirvanaApi } from "./nirvanaApi";
import { queryClient } from "../nirvanaApp";
import { useRecoilValue } from "recoil";

export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
}

export const localHost = "http://localhost:5000/api";

const getUserDetails = async (
  accessToken: string,
  idToken: string
): Promise<User> => {
  return await axios.get(localHost + `/users?access_token=${accessToken}`, {
    headers: { Authorization: idToken },
  });
};

export function useGetUserDetails() {
  const authTokens = useRecoilValue($authTokens);

  return useQuery(
    Querytypes.GET_USER_DETAILS,
    () => getUserDetails(authTokens.accessToken, authTokens.idToken),
    {
      retry: false,
    }
  );
}

export function useCreateUser() {
  return useMutation(nirvanaApi.user.createUser, {
    onSettled: (data, error) => {
      return queryClient.invalidateQueries(Querytypes.GET_USER_DETAILS);
    },
  });
}
