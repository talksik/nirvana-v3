import { Avatar } from "antd";

export default function LineIcon({
  sourceImages,
  grayscale = true,
}: {
  sourceImages: string[];
  grayscale: boolean;
}) {
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
      {sourceImages?.map((avatarSrc, index) => (
        <Avatar
          key={`lineIcon-${avatarSrc}-${index}`}
          src={avatarSrc}
          shape="square"
          size={"default"}
          className={`${grayscale && "grayscale"}`}
        />
      ))}
    </Avatar.Group>
  );
}
