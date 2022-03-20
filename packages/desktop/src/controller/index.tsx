import { $authTokens, $searchQuery } from "./recoil";
import axios, { AxiosResponse } from "axios";
import { useMutation, useQuery } from "react-query";

import GetContactsResponse from "../../../core/responses/getContacts.response";
import GetConversationDetailsResponse from "@nirvana/core/responses/getConversationDetails.response";
import { ObjectId } from "mongodb";
import { RelationshipState } from "@nirvana/core/models/relationship.model";
import SearchResponse from "@nirvana/core/responses/search.response";
import UpdateRelationshipStateRequest from "../../../core/requests/updateRelationshipState.request";
import { User } from "@nirvana/core/models";
import { nirvanaApi } from "./nirvanaApi";
import { queryClient } from "../nirvanaApp";
import { useRecoilValue } from "recoil";

// =========== API
export const localHost = "http://localhost:5000/api";

const getUserDetails = async (accessToken: string, idToken: string) => {
  const response = await axios.get<User>(
    localHost + `/users?access_token=${accessToken}`,
    {
      headers: { Authorization: idToken },
    }
  );

  return response.data;
};

const search = async (idToken: string, searchQuery: string) => {
  const response = await axios.get<SearchResponse>(
    localHost + `/search?query=${searchQuery}`,
    {
      headers: { Authorization: idToken },
    }
  );

  return response.data;
};

const getConversationDetails = async (
  idToken: string,
  otherUserGoogleId: string
) => {
  const response = await axios.get<GetConversationDetailsResponse>(
    localHost + `/conversations/${otherUserGoogleId}`,
    {
      headers: { Authorization: idToken },
    }
  );

  return response.data;
};

const sendContactRequest = async (
  idToken: string,
  otherUserGoogleId: string
) => {
  const response = await axios.post(
    localHost + `/contacts/${otherUserGoogleId}`,
    null,
    {
      headers: { Authorization: idToken },
    }
  );

  return response.data;
};

const updateContactRequestState = async (
  idToken: string,
  reqObj: UpdateRelationshipStateRequest
) => {
  const response = await axios.put(localHost + `/contacts`, reqObj, {
    headers: { Authorization: idToken },
  });

  return response.data;
};

const getContactsBasicDetails = async (idToken: string) => {
  const response = await axios.get<GetContactsResponse>(
    localHost + `/contacts`,
    {
      headers: { Authorization: idToken },
    }
  );

  return response.data;
};

// ====== QUERIES
export enum Querytypes {
  GET_USER_DETAILS = "GET_USER_DETAILS",
  GET_SEARCH_RESULTS = "GET_SEARCH_RESULTS",
  GET_CONVERSATION_DETAILS = "GET_CONVERSATION_DETAILS",
  GET_CONTACTS_RELATIONSHIPS = "GET_CONTACTS_RELATIONSHIPS",
}
export function useGetUserDetails() {
  const authTokens = useRecoilValue($authTokens);

  return useQuery(
    Querytypes.GET_USER_DETAILS,
    () => getUserDetails(authTokens?.accessToken, authTokens?.idToken),
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );
}

export function useSearch() {
  const authTokens = useRecoilValue($authTokens);
  const searchQuery = useRecoilValue($searchQuery);

  return useQuery(
    Querytypes.GET_SEARCH_RESULTS,
    () => search(authTokens.idToken, searchQuery),
    { enabled: searchQuery ? true : false, refetchOnWindowFocus: false }
  );
}

export function useConversationDetails(otherUserGoogleId: string) {
  const authTokens = useRecoilValue($authTokens);

  return useQuery(
    Querytypes.GET_CONVERSATION_DETAILS + "/" + otherUserGoogleId,
    () => getConversationDetails(authTokens.idToken, otherUserGoogleId),
    { enabled: otherUserGoogleId ? true : false }
  );
}

export function useGetAllContactBasicDetails() {
  const authTokens = useRecoilValue($authTokens);

  return useQuery(
    Querytypes.GET_CONTACTS_RELATIONSHIPS,
    () => getContactsBasicDetails(authTokens.idToken),
    {
      refetchOnWindowFocus: false,
    }
  );
}

// =========== MUTATIONS

export function useSendContactRequest() {
  const authTokens = useRecoilValue($authTokens);

  return useMutation((otherGoogleUserId: string) =>
    sendContactRequest(authTokens.idToken, otherGoogleUserId)
  );
}

export function useUpdateRelationshipState() {
  const authTokens = useRecoilValue($authTokens);

  return useMutation(
    (updateReqObj: UpdateRelationshipStateRequest) =>
      updateContactRequestState(authTokens.idToken, updateReqObj),
    {
      onSettled: (data, error) => {
        return queryClient.invalidateQueries(
          Querytypes.GET_CONVERSATION_DETAILS + "/" + ""
        );
      },
    }
  );
}
