import { $authFailureCount, $authTokens } from "../../controller/recoil";
import Channels, { STORE_ITEMS } from "../../electron/constants";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import Logo from "../../components/Logo";

export default function Login({ onReady }: { onReady: () => void }) {
  const setAuthTokens = useSetRecoilState($authTokens);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authFailureCount, setAuthFailureCount] =
    useRecoilState($authFailureCount);

  const continueAuth = () => {
    setIsLoading(true);
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    window.electronAPI.auth.initiateLogin();
  };

  const logOut = () => {
    window.electronAPI.store.set(STORE_ITEMS.AUTH_TOKENS, null);
  };

  const setAccessTokensAndContinue = (tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }) => {
    setAuthTokens(tokens);

    console.log(tokens.idToken);

    onReady();
  };

  useEffect(() => {
    // todo solve this better by just using refresh token in the backend

    setAuthFailureCount((prevVal) => prevVal + 1);

    // if failure count is 2, then just log the user out
    if (authFailureCount >= 2) {
      logOut();
    } else {
      // todo: comment all of this else when trying to test with two users/instances

      // see if we have tokens in localstorage in which case we can continue on
      window.electronAPI.store
        .get(STORE_ITEMS.AUTH_TOKENS)
        .then((tokensFromStore: any) => {
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
    }

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
