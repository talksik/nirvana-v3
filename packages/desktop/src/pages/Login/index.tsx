import { Button } from "@mui/material";
import Logo from "../../components/Logo";
import { channels } from "../../shared/constants";
import { useEffect } from "react";

export default function Login() {
  const logIn = () => {
    // send to main process
    window.API.send(channels.ACTIVATE_LOG_IN);
  };

  useEffect(() => {
    window.API.receive(channels.AUTH_TOKEN, (data: any) => {
      console.log(data);
    });

    // return () => {
    //   ipcRenderer.removeAllListeners(channels.AUTH_TOKEN);
    // };
  }, []);

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-slate-900">
      <Logo className="scale-50" />
      <Button onClick={logIn} variant="contained">
        Sign In
      </Button>
    </div>
  );
}
