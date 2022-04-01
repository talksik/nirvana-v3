import Channels, { STORE_ITEMS } from "../../electron/constants";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { $jwtToken } from "../../controller/recoil";
import { CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import Logo from "../../components/Logo";
import { useLogin } from "../../controller/index";

export default function Login() {
  const { mutateAsync } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setJwtToken = useSetRecoilState($jwtToken);

  useEffect(() => {
    window.electronAPI.once(
      Channels.GOOGLE_AUTH_TOKENS,
      async (tokens: {
        access_token: string;
        id_token: string;
        refresh_token: string;
      }) => {
        console.log("got tokens", tokens);

        setIsLoading(true);
        // todo: implement refresh token procedure in api layer by sending refresh_token and such

        const loginResponse = await mutateAsync({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
        });

        const { jwtToken, userDetails } = loginResponse;
        setJwtToken(jwtToken);
      }
    );

    // todo: figure out how to clean up with the preload api
    // return () => {
    //   window.electronAPI.removeAllListeners(Channels.GOOGLE_AUTH_TOKENS);
    // };
  }, []);

  const continueAuth = () => {
    setIsLoading(true);

    // send to main process
    window.electronAPI.auth.initiateLogin();
  };

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-zinc-700">
      <Logo className="scale-50" />

      {isLoading ? (
        <>
          <CircularProgress />
          <span className="text-white">Attempting to log you in</span>
        </>
      ) : (
        <button
          onClick={continueAuth}
          className=" text-md text-zinc-200 py-2 px-5 border border-gray-200 transition-all hover:bg-gray-200 hover:text-teal-500 rounded flex flex-row items-center space-x-2"
        >
          <FcGoogle className="text-lg" />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
