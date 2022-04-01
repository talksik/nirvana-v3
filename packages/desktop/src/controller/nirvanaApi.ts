import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import LoginResponse from "../../../core/responses/login.response";
import { User } from "@nirvana/core/models";
import UserDetailsResponse from "../../../core/responses/userDetails.response";

// export const localHost = process.env.REACT_APP_API_DOMAIN;

export const localHost = "http://localhost:5000/api";

export default class NirvanaApi {
  // auth token from google that our backend will use
  static _jwtToken?: string;

  static async fetch(url: string, method: Method, privateRoute = false) {
    // use the auth token if it's a private route
    // error if no auth token and it's a private route
    // throw error and show message on anything that is an error from the backend

    const fullUrl = localHost + url;

    let res;
    if (privateRoute && !this._jwtToken) throw Error("No jwt token available!");

    if (privateRoute && this._jwtToken) {
      res = await fetch(fullUrl, {
        method: method,
        headers: { Authorization: this._jwtToken },
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

export const ApiCalls = {
  login,
  authCheck,
  getUserDetails,
};
