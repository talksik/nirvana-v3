import { useEffect, useState } from "react";

import Channels from "../../electron/constants";
import { CircularProgress } from "@mui/material";
import Logo from "../../components/Logo";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const logIn = () => {
    setIsLoading(true);
    // send to main process
    // ipcRenderer.send(Channels.ACTIVATE_LOG_IN);
    window.electronAPI.auth.initiateLogin();
  };

  useEffect(() => {
    window.electronAPI.auth.receiveTokens(async (tokens: any) => {
      console.log(tokens);

      const { access_token, id_token, refresh_token } = tokens;

      // home should handle this user now that they have signed in with google
      navigate("/home");
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
          onClick={logIn}
          className="text-white p-3 rounded shadow border-white"
        >
          Sign In
        </button>
      )}
    </div>
  );
}
