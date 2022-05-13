import { Avatar, Dropdown, Menu } from 'antd';
import { FiLogOut } from 'react-icons/fi';
import React, { useMemo, useRef, useState } from 'react';

import { FaSearch } from 'react-icons/fa';
import useAuth from '../../../../providers/AuthProvider';
import useElectron from '../../../../providers/ElectronProvider';

/**
 * TODO: add in video mode
 *
 */
export default function NavBar() {
  const { user, handleLogout } = useAuth();
  const { desktopMode } = useElectron();

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState<string>('');

  /** hide the search bar in the header so that it's cleaner for these two modes */
  const shouldHideSearch = useMemo(() => {
    if (desktopMode === 'overlayOnly') return true;

    return false;
  }, [desktopMode]);

  const selectSearch = () => {
    inputRef.current?.focus();
  };

  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
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
              onKeyPress={handleLogout}
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
    <>
      <div
        className="flex flex-row items-center bg-gray-100 p-4 border-b border-b-gray-200"
        id="titlebar"
      >
        {/* <Tooltip title={desktopMode === 'flowState' ? 'unplugged' : 'connected'} placement="right">
          <div onClick={onHeaderFocus}>
            <Logo type="small" />
          </div>
        </Tooltip> */}

        {!shouldHideSearch && (
          <div className="mx-auto flex flex-row items-center space-x-2">
            <FaSearch className="text-xs text-gray-300" />
            <input
              placeholder="Type / to search"
              className="bg-transparent placeholder-gray-300 placeholder:text-xs focus:outline-none"
              ref={inputRef}
              onChange={onSearchChange}
              value={searchInput}
            />
          </div>
        )}

        {/* todo: move this ghost button to components */}
        {/* {desktopMode === 'flowState' ? (
          <button
            onClick={() => setDesktopMode('terminal')}
            className="ml-auto text-gray-300 text-xs p-3 transition-all hover:bg-gray-200"
          >
            connect
          </button>
        ) : (
          <button
            onClick={() => setDesktopMode('flowState')}
            className="text-gray-300 text-xs p-3 transition-all hover:bg-gray-200"
          >
            flow state
          </button>
        )} */}

        <Dropdown overlay={profileMenu}>
          <div className={'cursor-pointer ml-2'}>
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
    </>
  );
}
