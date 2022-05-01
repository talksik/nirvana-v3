import { Avatar } from "antd";

export default function LineIcon({ sourceImages }: { sourceImages: string[] }) {
  return (
    <Avatar.Group
      maxCount={2}
      maxPopoverTrigger="click"
      size="default"
      maxStyle={{
        color: "#f56a00",
        backgroundColor: "#fde3cf",
        cursor: "pointer",
        borderRadius: "0",
      }}
      className="shadow-lg"
    >
      {sourceImages?.map((avatarSrc) => (
        <Avatar src={avatarSrc} shape="square" size={"default"} />
      ))}
    </Avatar.Group>
  );
}
