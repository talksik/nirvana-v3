import {
  Add,
  CardGiftcardRounded,
  ContactsRounded,
  LinkRounded,
  PushPinRounded,
} from "@mui/icons-material";

export default function Conversations() {
  return (
    <>
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
    </>
  );
}
