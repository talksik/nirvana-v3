import { Avatar, Tooltip } from "antd";

import { FaAngleRight } from "react-icons/fa";
import { ReactElement } from "react";
import { User } from "@nirvana/core/models/user.model";

export default function BasicUserRow({
  user,
  rightJsx,
}: {
  user: User;
  rightJsx?: ReactElement;
}) {
  return (
    <span
      key={user._id.toString() + new Date().toDateString()}
      className="border-t border-t-gray-200 py-3 px-2 flex flex-row justify-start 
    items-center w-full hover:bg-gray-300 cursor-pointer group"
    >
      <Avatar
        key={`searchUsers-${user._id.toString()}`}
        shape="square"
        src={user.picture}
        size="default"
        className="shadow-lg mx-5"
      />

      <span className="flex flex-col items-start">
        <span className="text-gray-500 text-lg font-semibold">{user.name}</span>

        <span className="text-zinc-300">{user.email}</span>
      </span>

      <div className="ml-auto">{rightJsx}</div>
    </span>
  );
}
