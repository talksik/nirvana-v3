import { Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

import Channels from "../../electron/constants";
import Logo from "../../components/Logo";
import { UserInfo } from "@nirvana/core/models";
import axios from "axios";
import { useGetUserDetails } from "../../controller";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const logIn = () => {
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
  };

  // useEffect(() => {
  //   window.API.receive(channels.AUTH_TOKENS, async (tokens: any) => {
  //     console.log(tokens);

  //     const { access_token, id_token, refresh_token } = tokens;

  //     // get user info from access token
  //     const userInfo: UserInfo = await (
  //       await fetch(
  //         `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
  //       )
  //     ).json();

  //     console.log("user data: ");
  //     console.log(userInfo);

  //     // if user is an existing user, then continue to next route
  //     axios({
  //       method: "GET",
  //       url: localHost + `/user`,
  //       headers: {
  //         Authorization:
  //           "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ2M2RiZTczYWFkODhjODU0ZGUwZDhkNmMwMTRjMzZkYzI1YzQyOTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MjM1MzMyNDQ5NTMtYmFubGlnb2JnYm9mOGhnODlpNmNyMWw3dTBwN2MycGsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MjM1MzMyNDQ5NTMtYmFubGlnb2JnYm9mOGhnODlpNmNyMWw3dTBwN2MycGsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM0NzA3ODY2OTAzNTMxMDkwODYiLCJlbWFpbCI6InBhdGVsLmFyanVuNTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJKRlBBOC15TGgxeGlGOW5acUZQU0FBIiwibmFtZSI6IkFyanVuIFBhdGVsIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdqbTI5U2QxV25tOE52WmJYa29zdmY2U29JRDZrQlA1T0hSTFZJT0JRPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFyanVuIiwiZmFtaWx5X25hbWUiOiJQYXRlbCIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjQ3Mzc4MzgzLCJleHAiOjE2NDczODE5ODN9.llIYMEjq3Ye1UFxiKIsgtjnRho2Ad7dQjCSFVDDlsiH3AVq_MssoKTXMS0tuHpQAZAfyqbi1kRpp4Ax3mFJb44z2OIyzOTDzhcNB_L_3C8U3gRuSmUaVfBa7EdkobkxByee3ddvjekD7Y9dobtXs3IllldjewD9Eg9FZmEkuSN6yYVxxRLYNYTjk_BAA17QKKkPPpyanAHHXLwxpMFhQc34tuAYCYmmDQQijV8YVvU4r9ruPpysumVXlUmX3CuNg9P415Dq1lUHQxaf5hWf_6RxIsw9PNg1wZ8CuJGvmLFnGBRQACKgnAkI9E7-tu2tWe3glRhORZlQmgRCKqG5xoA",
  //       },
  //     }).then((res) => console.log(res));

  //     navigate("/home");

  //     // if user is not an existing user, then show create account page
  //   });

  //   // return () => {
  //   //   ipcRenderer.removeAllListeners(channels.AUTH_TOKEN);
  //   // };
  // }, []);

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-slate-900">
      <Logo className="scale-50" />
      <CircularProgress />

      <Button onClick={logIn} variant="contained">
        Sign In
      </Button>
    </div>
  );
}
