import NirvanaApi, { ApiCalls } from "./nirvanaApi";
import { useMutation, useQuery } from "react-query";

import { $jwtToken } from "./recoil";
import { queryClient } from "../pages/nirvanaApp";
import { useRecoilValue } from "recoil";

// ====== QUERIES

/**
 * ensure that the server is up
 */
export function useServerCheck() {
  return useQuery("SERVER_CHECK", ApiCalls.serverCheck, {
    retry: true,
    refetchOnWindowFocus: false,

    refetchInterval: 10000,
  });
}

export function useAuthCheck(enabled: boolean = true) {
  const jwtToken = useRecoilValue($jwtToken);

  return useQuery("AUTH_CHECK", ApiCalls.authCheck, {
    retry: false,
    refetchOnWindowFocus: false,

    refetchInterval: 10000,
    enabled,
  });
}

export function useLogin() {
  return useMutation("LOGIN", ApiCalls.login);
}

export function useGetUserDetails() {
  return useQuery("USER_DETAILS", ApiCalls.getUserDetails, {
    retry: false,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.log(err);
    },
  });
}

export function useUserSearch(searchQuery: string) {
  return useQuery("USER_SEARCH", () => ApiCalls.userSearch(searchQuery), {
    enabled: searchQuery ? true : false,
    refetchOnWindowFocus: false,
  });
}

/** query responsible solely for getting lines and the intersection with sockets happens elsewhere */
export function useUserLines() {
  // todo: base/source of truth for getting all of the lines for the user
  // merge with sockets + audio clip data + master data + convomember data

  return useQuery("USER_LINES", ApiCalls.getUserLines, {
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    staleTime: Infinity,
  });
}

// =========== MUTATIONS
export function useGetDmByUserId() {
  return useMutation(ApiCalls.getDmByUserId);
}

export function useCreateLine() {
  return useMutation(ApiCalls.createLine, {
    onSuccess: (res, req) => {
      queryClient.invalidateQueries(["USER_LINES"]);
    },
  });
}
