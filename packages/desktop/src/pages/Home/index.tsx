import {
  Add,
  CardGiftcardRounded,
  ContactsRounded,
  LinkRounded,
  PushPinRounded,
} from "@mui/icons-material";
import Logo, { LogoType } from "../../components/Logo";

export default function Home() {
  return (
    <div className="h-screen w-screen bg-slate-700">
      {/* header */}
      <div className="flex flex-row items-center bg-slate-800 h-20">
        <Logo type={LogoType.small} className="scale-[0.4]" />
        <input
          placeholder="type / to search"
          className="placeholder:text-slate-400 bg-transparent outline-none text-slate-100"
        />

        <button className="ml-auto hover:scale-110 bg-slate-600 text-teal-500 py-1 px-2 rounded-lg text-sm">
          flow state
        </button>

        <span className="relative mx-5">
          <img
            src="https://lh3.googleusercontent.com/a-/AOh14Gjm29Sd1Wnm8NvZbXkosvf6SoID6kBP5OHRLVIOBQ=s96-c"
            className="rounded-lg h-8 hover:bg-slate-200 hover:cursor-pointer hover:scale-110"
            alt="cannot find"
          />
          <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
        </span>
      </div>

      {/* actions navbar */}
      <div className="flex justify-end mx-10 mt-5 space-x-3">
        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <ContactsRounded className="text-slate-100" fontSize="small" />
        </span>

        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <LinkRounded className="text-slate-100" fontSize="small" />
        </span>

        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <CardGiftcardRounded className="text-pink-100" fontSize="small" />
        </span>
        <span className="hover:bg-slate-500 p-1 rounded-full cursor-pointer flex justify-center items-center">
          <Add className="text-slate-100" fontSize="small" />
        </span>
      </div>

      {/* pinned conversations */}
      <div className="m-5 bg-slate-500 shadow-lg rounded">
        <span className="flex flex-row justify-start p-4 items-center">
          <PushPinRounded className="text-slate-100" />
          <span className="tracking-wider text-slate-100 uppercase text-sm font-semibold">
            Pinned
          </span>
        </span>
      </div>
    </div>
  );
}
