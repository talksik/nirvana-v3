import { Avatar } from 'antd';

import React, { useMemo } from 'react';

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
            grayscale ? 'grayscale opacity-40' : ''
          } h-[40px] w-[40px] flex-grow-0`}
        >
          {sourceImages.map((avatarSrc, index) => {
            if (index === 0) {
              return (
                <Avatar
                  key={`lineIcon-${avatarSrc}-${index}`}
                  src={avatarSrc}
                  shape="square"
                  size={'small'}
                  className={`shadow-lg absolute bottom-0 left-0 bg-slate-200`}
                />
              );
            } else if (index === 1) {
              return (
                <Avatar
                  key={`lineIcon-${avatarSrc}-${index}`}
                  src={avatarSrc}
                  shape="square"
                  size={'small'}
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
            size={'large'}
            className={`${grayscale && 'grayscale opacity-40'} shadow-lg`}
          />
        ))
      )}
    </>
  );
}

export default React.memo(LineIcon);
