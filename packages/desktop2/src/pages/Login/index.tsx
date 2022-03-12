import { Button } from "@mui/material";
import Logo from "../../components/Logo";
import { channels } from "../../shared/constants";

export default function () {
  const logIn = () => {
    // send to main process
    window.API.activateLogin();
  };

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-slate-900">
      <Logo className="scale-50" />
      <Button onClick={logIn} variant="contained">
        Sign In
      </Button>
    </div>
  );
}
