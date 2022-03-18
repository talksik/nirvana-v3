import { useEffect, useState } from "react";

import { $authTokens } from "../../controller/recoil";
import Channels from "../../electron/constants";
import { CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import Logo from "../../components/Logo";
import { nirvanaApi } from "../../controller/nirvanaApi";
import { useCreateUser } from "../../controller/index";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";

export default function Login() {
  const navigate = useNavigate();
  const setAuthTokens = useSetRecoilState($authTokens);

  const continueAuth = () => {
    setIsLoading(true);
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    window.electronAPI.auth.initiateLogin();
  };

  useEffect(() => {
    window.electronAPI.auth.receiveTokens(
      Channels.AUTH_TOKENS,
      (tokens: any) => {
        // todo: implement refresh token procedure in api layer by sending refresh_token and such
        const { access_token, id_token, refresh_token } = tokens;
        setAuthTokens({
          accessToken: access_token,
          idToken: id_token,
          refreshToken: refresh_token,
        });

        // now can go to home and get authenticated regardless of type of user
        navigate("/home");
      }
    );

    // todo: figure out how to clean up with the preload api
    // return () => {
    //   window.electronAPI.removeAllListeners(Channels.AUTH_TOKENS);
    // };
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-slate-900">
      <Logo className="scale-50" />

      {isLoading ? (
        <>
          <CircularProgress />
          <span className="text-white">Attempting to log you in</span>
        </>
      ) : (
        <button
          onClick={continueAuth}
          className=" text-md text-slate-200 py-2 px-5 border border-gray-200 transition-all hover:bg-gray-200 hover:text-teal-500 rounded flex flex-row items-center space-x-2"
        >
          <FcGoogle className="text-lg" />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
