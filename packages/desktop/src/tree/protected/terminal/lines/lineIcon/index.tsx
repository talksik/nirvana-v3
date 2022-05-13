import { Avatar } from "antd";
import React from "react";
import { useMemo } from "react";

function LineIcon({
  sourceImages,
  grayscale = true,
}: {
  sourceImages: string[];
  grayscale: boolean;
}) {
  const isMultiple = useMemo(() => {
    if (sourceImages?.length > 1) return true;

    return false;
  }, [sourceImages]);

  return (
    <>
      {isMultiple ? (
        <div
          className={`relative ${
            grayscale ? "grayscale" : ""
          } h-[32px] w-[32px]`}
        >
          {sourceImages.map((avatarSrc, index) => {
            if (index === 0) {
              return (
                <Avatar
                  key={`lineIcon-${avatarSrc}-${index}`}
                  src={avatarSrc}
                  shape="square"
                  size={"small"}
                  className={`shadow-lg absolute bottom-0 left-0 bg-slate-200`}
                />
              );
            } else if (index === 1) {
              return (
                <Avatar
                  key={`lineIcon-${avatarSrc}-${index}`}
                  src={avatarSrc}
                  shape="square"
                  size={"small"}
                  className={`absolute top-0 right-0  bg-slate-200`}
                />
              );
            }

            // TODO: add third in the frame if we want later
            return <></>;
          })}
        </div>
      ) : (
        sourceImages?.map((avatarSrc, index) => (
          <Avatar
            key={`lineIcon-${avatarSrc}-${index}`}
            src={avatarSrc}
            shape="square"
            size={"default"}
            className={`${grayscale && "grayscale"} shadow-lg`}
          />
        ))
      )}
    </>
  );
}

export default React.memo(LineIcon);
