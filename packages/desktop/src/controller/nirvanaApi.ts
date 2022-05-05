import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import CreateLineRequest from "@nirvana/core/requests/createLine.request";
import GetUserLinesResponse from "@nirvana/core/responses/getUserLines.response";
import { Line } from "@nirvana/core/models/line.model";
import LoginResponse from "../../../core/responses/login.response";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import NirvanaResponse from "../../../core/responses/nirvanaResponse";
import { User } from "@nirvana/core/models";
import UserDetailsResponse from "../../../core/responses/userDetails.response";
import UserSearchResponse from "../../../core/responses/userSearch.response";

// export const localHost = process.env.REACT_APP_API_DOMAIN;

export const localHost = "http://localhost:5000/api";

export default class NirvanaApi {
  // auth token from google that our backend will use
  static _jwtToken?: string;

  static async fetch(
    url: string,
    method: Method,
    privateRoute = false,
    body: object = null
  ) {
    // use the auth token if it's a private route
    // error if no auth token and it's a private route
    // throw error and show message on anything that is an error from the backend

    const fullUrl = localHost + url;

    let res;
    if (privateRoute && !this._jwtToken) throw Error("No jwt token available!");

    if (privateRoute && this._jwtToken) {
      res = await fetch(fullUrl, {
        method: method,
        headers: {
          Authorization: this._jwtToken,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });
    } else {
      res = await fetch(fullUrl);
    }

    if (!res.ok) {
      if (res.status === 401) throw new Error("You are not authorized here");

      throw new Error("Something went wrong");
    }

    return await res.json();
  }
}

async function login(reqLoginTokens: {
  accessToken: string;
  idToken: string;
}): Promise<LoginResponse> {
  return await NirvanaApi.fetch(
    `/user/login?access_token=${reqLoginTokens.accessToken}&id_token=${reqLoginTokens.idToken}`,
    "GET",
    false
  );
}

async function authCheck(): Promise<void> {
  return await NirvanaApi.fetch(`/user/authcheck`, "GET", true);
}

async function getUserDetails(): Promise<UserDetailsResponse> {
  return await NirvanaApi.fetch(`/user`, "GET", true);
}

async function userSearch(searchQuery: string): Promise<UserSearchResponse> {
  return await NirvanaApi.fetch(
    `/search/users?query=${searchQuery}`,
    "GET",
    true
  );
}

async function getUserLines(): Promise<NirvanaResponse<GetUserLinesResponse>> {
  return await NirvanaApi.fetch(`/lines`, "GET", true);
}

async function getDmByUserId(otherUserId: string): Promise<Line> {
  return await NirvanaApi.fetch(`/lines/dm/${otherUserId}`, "GET", true);
}

async function createLine(
  request: CreateLineRequest
): Promise<NirvanaResponse<Line>> {
  return await NirvanaApi.fetch(`/lines`, "POST", true, request);
}

export const ApiCalls = {
  login,
  authCheck,
  getUserDetails,
  userSearch,
  getUserLines,
  getDmByUserId,
  createLine,
};
