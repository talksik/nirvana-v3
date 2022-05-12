import { UserStatus } from "@nirvana/core/models";

export default function UserStatusText(props: { status: UserStatus }) {
  switch (props.status) {
    case UserStatus.ONLINE:
      return <span className="text-emerald-600 text-sm lowercase">ONLINE</span>;
    case UserStatus.OFFLINE:
      return <></>;
    case UserStatus.FLOW_STATE:
      return (
        <span className="text-pink-400 text-sm lowercase">FLOW STATE</span>
      );
    default:
      return <></>;
  }
}
