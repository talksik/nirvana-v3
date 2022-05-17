import { Avatar, Dropdown, Menu } from 'antd';
import { FiLogOut, FiSearch } from 'react-icons/fi';
import React, { useMemo, useRef, useState } from 'react';

import { FaPlus, FaSearch } from 'react-icons/fa';
import useAuth from '../../../../providers/AuthProvider';
import useElectron from '../../../../providers/ElectronProvider';
import useSockets from '../../../../providers/SocketProvider';
import NoTextLogo from '@nirvana/components/logo/NoTextLogo';

/**
 * TODO: add in video mode
 *
 */
export default function NavBar() {
  const { user, handleLogout } = useAuth();
  const { desktopMode, handleOpenMainApp } = useElectron();

  const { handleFlowState } = useSockets();

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /** hide the search bar in the header so that it's cleaner for these two modes */
  const shouldHideSearch = useMemo(() => {
    if (desktopMode === 'overlayOnly') return true;

    return false;
  }, [desktopMode]);

  const selectSearch = () => {
    inputRef.current?.focus();
  };

  // todo: do I need a mute mode? isn't that just flow state
  // might confuse user overall
  const profileMenu = (
    <Menu
      items={[
        // {
        //   label: (
        //     <span onClick={handleMuteToggle}>
        //       {mediaSettings.isMuted ? "Unmute" : "Mute"}
        //     </span>
        //   ),
        //   icon: <> {mediaSettings.isMuted ? <FiMicOff /> : <FiMic />} </>,
        //   key: `profile-menu-${1}`,
        // },
        // {
        //   label: <span>Audio Only</span>,
        //   icon: <> {mediaSettings.mode === 'audio' ? <FiCheck /> : <></>} </>,
        //   disabled: false,
        //   key: `profile-menu-${2}`,
        // },
        // {
        //   label: (
        //     <Tooltip title="coming soon">
        //       <span>Video</span>
        //     </Tooltip>
        //   ),
        //   icon: <>{mediaSettings.mode === 'video' ? <FiCheck /> : <></>} </>,
        //   disabled: true,
        //   key: `profile-menu-${3}`,
        // },
        // {
        //   label: (
        //     <Tooltip title="coming soon">
        //       <span>Screen</span>
        //     </Tooltip>
        //   ),
        //   icon: <>{mediaSettings.mode === 'screen' ? <FiCheck /> : <></>} </>,
        //   disabled: true,
        //   key: `profile-menu-${3}`,
        // },

        {
          type: 'divider',
          key: `profile-menu-${4}`,
        },
        {
          label: (
            <button
              onClick={(e) => {
                handleLogout();
              }}
            >
              Sign Out
            </button>
          ),
          icon: <FiLogOut />,
          key: `profile-menu-${5}`,
          danger: true,
        },
      ]}
    />
  );

  return (
    <div
      className="flex flex-row gap-3 items-center bg-gray-100 border-b border-b-200 p-4"
      id="titlebar"
    >
      <div
        onKeyDown={() => {
          //
        }}
        onClick={() => {
          console.log('opening main app');
        }}
        role="presentation"
      >
        <NoTextLogo type="small" />
      </div>

      <div className="mx-auto flex flex-row items-center space-x-2 bg-gray-200 p-2 rounded w-[400px]">
        <FiSearch className="text-xs text-gray-300" />
        <input
          placeholder="Search for people, channels, clips..."
          className="flex-1 bg-transparent placeholder-gray-300 placeholder:text-xs focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
        />
      </div>

      <button
        onClick={handleFlowState}
        className="text-gray-300 text-xs p-3 transition-all hover:bg-gray-200"
      >
        flow state
      </button>

      <Dropdown overlay={profileMenu}>
        <div className={'cursor-pointer'}>
          {user.picture && (
            <Avatar
              key={`userHeaderProfilePicture`}
              className="shadow-md hover:scale-110 transition-all"
              size={'large'}
              alt={user.name}
              src={user.picture}
              shape="square"
            />
          )}
        </div>
      </Dropdown>

      {/* menu for the output options */}
      {/* <Menu
          open={menuOpen}
          id="user-output-selection-menu"
          anchorEl={anchorEl}
          onClose={handleCloseMenu}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={() => setOutputMode("audio")}>
            <ListItemIcon>
              <HeadsetMicSharp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Audio Only</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => setOutputMode("video")}>
            <ListItemIcon>
              <VideocamSharp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Video</ListItemText>
          </MenuItem>
        </Menu> */}
    </div>
  );
}
