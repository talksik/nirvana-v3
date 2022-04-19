import FullMottoLogo from "../../../components/logo/fullMotto";
import { toast } from "react-toastify";
import { useCallback } from "react";

const contactEmailAddress = "arjunpatel@berkeley.edu";

export default function Footer() {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(contactEmailAddress);

    toast.success("copied to clipboard");
  }, []);

  return (
    <div className="container mx-auto max-w-screen-lg flex md:flex-row flex-col justify-between mt-auto items-center">
      <span className="ml-20">
        <span className="text-zinc-400 text-sm">Wanna chat? </span>
        <span
          className="font-bold text-white cursor-pointer"
          onClick={copyToClipboard}
        >
          {contactEmailAddress}
        </span>
      </span>
      <FullMottoLogo className="text-center scale-50" />
    </div>
  );
}
