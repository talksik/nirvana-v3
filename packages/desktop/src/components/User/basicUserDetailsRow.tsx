import { FaAngleRight } from "react-icons/fa";
import { ReactElement } from "react";
import { Tooltip } from "antd";
import { User } from "@nirvana/core/models/user.model";

export default function UserRow({
  user,
  rightJsx,
}: {
  user: User;
  rightJsx?: ReactElement;
}) {
  return (
    <span
      key={user._id.toString() + new Date().toDateString()}
      className="border-t border-t-zinc-500 py-3 px-2 flex flex-row justify-start 
    items-center w-full hover:bg-zinc-600 cursor-pointer group"
    >
      <span className="relative mx-5">
        <img
          src={user.picture}
          className="rounded-lg h-8 hover:bg-zinc-200 hover:cursor-pointer hover:scale-110"
          alt=""
        />
        <span className="absolute bottom-0 -right-1.5 rounded-full bg-emerald-600 h-3 w-3"></span>
      </span>

      <span className="flex flex-col items-start">
        <span className="text-zinc-200 text-lg font-semibold">{user.name}</span>

        <span className="text-zinc-300">{user.email}</span>
      </span>

      <div className="ml-auto">{rightJsx}</div>
    </span>
  );
}
