import { Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

import Logo from "../../components/Logo";
import { UserInfo } from "@nirvana/core/models";
import { channels } from "../../shared/constants";
import { useNavigate } from "react-router-dom";

export default function Login() {
  let navigate = useNavigate();

  const logIn = () => {
    // send to main process
    window.API.send(channels.ACTIVATE_LOG_IN);
  };

  useEffect(() => {
    window.API.receive(channels.AUTH_TOKEN, async (accessToken: string) => {
      console.log(accessToken);

      // get user info from access token
      const userInfo: UserInfo = await (
        await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
        )
      ).json();

      console.log("user data: ");
      console.log(userInfo);

      // if user is a user, then continue to next route
      navigate("/home");

      // if user is not an existing user, then show create account page
    });

    // return () => {
    //   ipcRenderer.removeAllListeners(channels.AUTH_TOKEN);
    // };
  }, []);

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
