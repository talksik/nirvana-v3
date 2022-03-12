import { Button } from "@mui/material";
import ElectronGoogleOAuth2 from "@getstation/electron-google-oauth2";
import Logo from "../../components/Logo";

export default function () {
  const signIn = () => {};

  return (
    <div className="container flex flex-col space-y-5 justify-center items-center h-screen bg-slate-900">
      <Logo className="scale-50" />
      <Button onClick={signIn} variant="contained">
        Sign In
      </Button>
    </div>
  );
}
