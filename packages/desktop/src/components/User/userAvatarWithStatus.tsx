import { User, UserStatus } from "@nirvana/core/models";

export default function UserAvatarWithStatus(props: { user: User }) {
  return (
    <span className="relative">
      <img
        src={props.user.picture}
        className="rounded-lg h-8 hover:bg-slate-200 hover:cursor-pointer hover:scale-110"
        alt=""
      />

      <UserStatusBubble status={props.user.status} />
    </span>
  );
}

export function UserStatusBubble(props: { status: UserStatus }) {
  switch (props.status) {
    case UserStatus.ONLINE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 h-3 w-3 border border-slate-300"></span>
      );
    case UserStatus.OFFLINE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-400 h-3 w-3 border border-slate-300"></span>
      );
    case UserStatus.FLOW_STATE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-pink-400 h-3 w-3 border border-slate-300"></span>
      );
    default:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-pink-400 h-3 w-3 border border-slate-300"></span>
      );
  }
}
