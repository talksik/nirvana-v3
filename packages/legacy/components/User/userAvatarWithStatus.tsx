import { User, UserStatus } from "@nirvana/core/models";

export default function UserAvatarWithStatus(props: { user: User }) {
  return (
    <div className="relative">
      <img
        src={props.user.picture}
        className="rounded-lg h-8 hover:bg-zinc-200 hover:cursor-pointer hover:scale-110"
        alt=""
      />

      <UserStatusBubble status={props.user.status} />
    </div>
  );
}

export function UserStatusBubble(props: { status: UserStatus }) {
  switch (props.status) {
    case UserStatus.ONLINE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 h-3 w-3"></span>
      );
    case UserStatus.OFFLINE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-zinc-400 h-3 w-3"></span>
      );
    case UserStatus.FLOW_STATE:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-pink-400 h-3 w-3"></span>
      );
    default:
      return (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-pink-400 h-3 w-3"></span>
      );
  }
}
