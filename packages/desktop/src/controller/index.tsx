import NirvanaApi, { ApiCalls } from "./nirvanaApi";
import { useMutation, useQuery } from "react-query";

// ====== QUERIES
export function useAuthCheck() {
  return useQuery("AUTH_CHECK", ApiCalls.authCheck, {
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLogin() {
  return useMutation("LOGIN", ApiCalls.login, {});
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

// =========== MUTATIONS
export function useGetDmByUserId() {
  return useMutation(ApiCalls.getDmByUserId);
}

export function useCreateConvo() {
  return useMutation(ApiCalls.createConversation);
}
