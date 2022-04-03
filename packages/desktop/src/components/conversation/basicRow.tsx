import MasterConversation from "../../../../core/models/masterConversation.model";
import UserStatusText from "../User/userStatusText";
export default function BasicConversationRow({
  masterConvo,
}: {
  masterConvo: MasterConversation;
}) {
  const isSelected = false;

  return (
    <div
      key={masterConvo.id.toString()}
      className={`flex flex-row items-center hover:bg-zinc-600 group py-4 px-2 cursor-pointer ${
        isSelected ? "bg-zinc-600" : ""
      } rounded`}
    >
      {/* <UserAvatarWithStatus user={contactDetail.otherUser} /> */}

      <span className="text-white font-semibold ml-2">{masterConvo.name}</span>
      <span className="text-white font-semibold ml-2">
        {masterConvo.id.toString()}
      </span>

      {/* <span className="ml-2">
        <UserStatusText status={contactDetail.otherUser.status} />
      </span> */}

      {/* {speakingRooms.includes(contactDetail.relationship._id.toString()) ? (
        <span className="ml-auto">speaking...</span>
      ) : null} */}
    </div>
  );
}
