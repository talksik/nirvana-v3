import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { User } from "@nirvana/core/models";

// export const localHost = process.env.REACT_APP_API_DOMAIN;

export const localHost = "http://localhost:5000/api";

class NirvanaApi {
  // auth token from google that our backend will use
  private _authToken?: string;

  setGoogleIdToken(_googleIdToken: string) {
    this._authToken = _googleIdToken;
  }

  async fetch(url: string, method: string, privateRoute = false) {
    // use the auth token if it's a private route
    // error if no auth token and it's a private route
    // throw error and show message on anything that is an error from the backend

    try {
      const fullUrl = localHost + url;

      var res;
      if (privateRoute && this._authToken) {
        res = await fetch(fullUrl, {
          method: method,
          headers: { Authorization: this._authToken },
        });
      } else {
        res = await fetch(fullUrl);
      }

      return await res.json();
    } catch (error) {
      console.log(error);

      throw Error(error);
    }
  }

  user = {
    async getUserDetails(accessToken: string): Promise<User> {
      return await axios.get(localHost + `/users?access_token=${accessToken}`, {
        headers: { Authorization: this._authToken },
      });
    },
    async createUser(accessToken: string) {
      return await axios.post(
        localHost + `/users/create?access_token=${accessToken}`
      );
    },
  };
}

export const nirvanaApi = new NirvanaApi();
