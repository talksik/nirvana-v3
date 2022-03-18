import { useEffect, useState } from "react";

import Channels from "../../electron/constants";
import { CircularProgress } from "@mui/material";
import Logo from "../../components/Logo";
import { nirvanaApi } from "../../controller/nirvanaApi";
import { useCreateUser } from "../../controller/index";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const { mutateAsync } = useCreateUser();

  const continueAuth = () => {
    setIsLoading(true);
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    window.electronAPI.auth.initiateLogin();
  };

  useEffect(() => {
    window.electronAPI.auth.receiveTokens(
      Channels.AUTH_TOKENS,
      async (tokens: any) => {
        console.log(tokens);

        // todo: implement refresh token procedure in api layer by sending refresh_token and such
        const { access_token, id_token, refresh_token } = tokens;

        nirvanaApi.setGoogleIdToken(id_token);

        // create user if on sign up page
        if (isSignUp) {
          await mutateAsync(access_token);
        }

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
          className="text-white p-3 rounded shadow border border-white"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      )}

      {isSignUp ? (
        <button onClick={() => setIsSignUp(false)} className="text-slate-200">
          Sign In Here
        </button>
      ) : (
        <button onClick={() => setIsSignUp(true)} className="text-slate-200">
          Create Account Here
        </button>
      )}
    </div>
  );
}
