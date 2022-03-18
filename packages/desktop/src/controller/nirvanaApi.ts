import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { User } from "@nirvana/core/models";

// export const localHost = process.env.REACT_APP_API_DOMAIN;

export const localHost = "http://localhost:5000";

class NirvanaApi {
  // auth token from google that our backend will use
  private _authToken?: string;

  setPrivateToken(_googleIdToken: string) {
    this._authToken = _googleIdToken;
  }

  async fetch<T>(options: AxiosRequestConfig, privateRoute = false) {
    // use the auth token if it's a private route
    // error if no auth token and it's a private route
    // throw error and show message on anything that is an error from the backend
    if (privateRoute && this._authToken) {
      return await axios.request<T>({
        ...options,
        headers: { Authorization: this._authToken },
      });
    }

    return axios.request<T>(options);
  }

  async getUserDetails(): Promise<AxiosResponse<User>> {
    return await this.fetch<User>(
      {
        method: "GET",
        url: localHost + `/users`,
      },
      true
    );
  }
}

export const nirvanaApi = new NirvanaApi();
