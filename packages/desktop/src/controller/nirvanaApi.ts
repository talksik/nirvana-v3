import axios, { AxiosRequestConfig } from "axios";

// export const localHost = process.env.REACT_APP_API_DOMAIN;

export const localHost = "http://localhost:5000";

class NirvanaApi {
  // auth token from google that our backend will use
  private _authToken?: string;

  setPrivateToken(_googleIdToken: string) {
    this._authToken = _googleIdToken;
  }

  async fetch(options: AxiosRequestConfig, privateRoute = false) {
    // use the auth token if it's a private route
    // error if no auth token and it's a private route
    // throw error and show message on anything that is an error from the backend
    if (privateRoute && this._authToken) {
      return await axios({
        ...options,
        headers: { Authorization: this._authToken },
      });
    }

    return axios(options);
  }

  async getUserDetails() {
    return await this.fetch(
      {
        method: "GET",
        url: localHost + `/users`,
      },
      true
    );
  }
}

export const nirvanaApi = new NirvanaApi();
