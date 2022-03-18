import Channels, { STORE_ITEMS } from "../../electron/constants";
import { useEffect, useState } from "react";

import { $authTokens } from "../../controller/recoil";
import { CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import Logo from "../../components/Logo";
import { nirvanaApi } from "../../controller/nirvanaApi";
import { useCreateUser } from "../../controller/index";
import { useSetRecoilState } from "recoil";

export default function Login({ onReady }: { onReady: Function }) {
  const setAuthTokens = useSetRecoilState($authTokens);

  const continueAuth = () => {
    setIsLoading(true);
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    window.electronAPI.auth.initiateLogin();
  };

  const setAccessTokensAndContinue = (tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }) => {
    setAuthTokens(tokens);

    onReady();
  };

  useEffect(() => {
    // see if we have tokens in localstorage in which case we can continue on
    window.electronAPI.store
      .get(STORE_ITEMS.AUTH_TOKENS)
      .then((tokensFromStore: any) => {
        console.log(tokensFromStore);

        if (tokensFromStore) {
          setIsLoading(true);

          const { access_token, id_token, refresh_token } = tokensFromStore;

          setAccessTokensAndContinue({
            accessToken: access_token,
            idToken: id_token,
            refreshToken: refresh_token,
          });
        }
      });

    window.electronAPI.once(Channels.AUTH_TOKENS, (tokens: any) => {
      setIsLoading(true);

      // todo: implement refresh token procedure in api layer by sending refresh_token and such
      const { access_token, id_token, refresh_token } = tokens;

      setAccessTokensAndContinue({
        accessToken: access_token,
        idToken: id_token,
        refreshToken: refresh_token,
      });
    });

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
