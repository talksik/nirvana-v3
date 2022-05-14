import React, { useContext, useEffect, useState, useCallback } from 'react';
import Channels, { DEFAULT_APP_PRESET, Dimensions } from '../electron/constants';

interface IElectronProvider {
  // pass handlers and current dimensions?
  desktopMode: DesktopMode;

  handleOpenMainApp?: () => void;
}

type DesktopMode = 'overlayOnly' | 'mainApp';

const ElectronContext = React.createContext<IElectronProvider>({
  desktopMode: 'mainApp',
});

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const [desktopMode, setDesktopMode] = useState<DesktopMode>('mainApp');

  // handle all window resizing logic
  useEffect(() => {
    // add dimensions if it's not overlay only mode
    let finalDimensions: Dimensions = { height: 0, width: 0 };
    let finalPosition: 'center' | 'topRight';
    let stayOnTop: boolean;

    if (desktopMode === 'mainApp') {
      stayOnTop = false;
      finalDimensions = DEFAULT_APP_PRESET;
    } else if (desktopMode === 'overlayOnly') {
      stayOnTop = true;
      finalDimensions = {
        height: 668,
        width: 360,
      };
    }

    // send the final dimensions to main process
    window.electronAPI.window.resizeWindow({
      setAlwaysOnTop: stayOnTop,
      dimensions: {
        height: finalDimensions.height,
        width: finalDimensions.width,
      },
      setPosition: finalPosition,
      addDimensions: false,
    });
  }, [desktopMode]);

  // handle window focus and unfocus
  useEffect(() => {
    window.electronAPI.on(Channels.ON_WINDOW_BLUR, () => {
      console.log(
        'window blurring now, should be always on top and then ill tell main process to change dimensions',
      );
      // TODO: testing mode... uncomment both instructions below
      // setDesktopMode("overlayOnly");

      // todo: make sure that if I am toggle broadcasted into a line, then don't deselect selected line
      // the overlay should be showing selected line if I am broadcasting toggled into it as well as of course all other toggle tuned ones
      // setSelectedLineId(null);
    });
  }, [setDesktopMode]);

  const handleOpenMainApp = useCallback(() => {
    setDesktopMode('mainApp');
  }, [setDesktopMode]);

  return (
    <ElectronContext.Provider value={{ desktopMode, handleOpenMainApp }}>
      {children}
    </ElectronContext.Provider>
  );
}

export default function useElectron() {
  return useContext(ElectronContext);
}
