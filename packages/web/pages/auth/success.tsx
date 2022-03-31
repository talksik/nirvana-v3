import { FcGoogle } from "react-icons/fc";
import Footer from "../../components/footer";
import Header from "../../components/header";

export default function AuthSuccess() {
  return (
    <>
      <Header />

      <div className="my-auto flex flex-col items-center justify-center">
        <FcGoogle className="text-6xl m-10" />
        <span className="text-white text-6xl leading-[1.2] font-extrabold">
          {"You're Signed In"}
        </span>

        <span className="text-zinc-400 text-xl mt-5">
          Go back to the desktop app that you download.
        </span>
      </div>
      <Footer />
    </>
  );
}
