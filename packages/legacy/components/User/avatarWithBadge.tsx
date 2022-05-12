import { Avatar, Badge } from "antd";

import { UserOutlined } from "@ant-design/icons";

const AvatarWithBadge = ({ src }: { src: string }) => (
  <>
    <span>
      <Badge dot>
        <Avatar shape="square" src={src} />
      </Badge>
    </span>
  </>
);

export default AvatarWithBadge;
