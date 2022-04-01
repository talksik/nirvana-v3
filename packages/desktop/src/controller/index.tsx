import NirvanaApi, { authCheck, login } from "./nirvanaApi";
import { useMutation, useQuery } from "react-query";

// ====== QUERIES
export function useAuthCheck() {
  return useQuery("AUTH_CHECK", authCheck, {
    retry: false,
  });
}

export function useLogin() {
  return useMutation("LOGIN", login, {});
}

// export function useGetUserDetails() {
//   const authTokens = useRecoilValue($authTokens);

//   return useQuery(
//     Querytypes.GET_USER_DETAILS,
//     () => getUserDetails(authTokens?.accessToken, authTokens?.idToken),
//     {
//       retry: false,
//       refetchOnWindowFocus: false,
//       onError: (err) => {
//         console.log(err);
//       },
//     }
//   );
// }

// export function useSearch() {
//   const authTokens = useRecoilValue($authTokens);
//   const searchQuery = useRecoilValue($searchQuery);

//   return useQuery(
//     Querytypes.GET_SEARCH_RESULTS,
//     () => search(authTokens.idToken, searchQuery),
//     { enabled: searchQuery ? true : false, refetchOnWindowFocus: false }
//   );
// }

// =========== MUTATIONS
