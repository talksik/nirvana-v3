import {
  $desktopMode,
  $maxNumberActiveStreams,
  $numberActiveLines,
  $selectedLineId,
} from '../../controller/recoil';
import Channels, {
  DEFAULT_APP_PRESET,
  Dimensions,
} from '../../electron/constants';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import FullMottoLogo from '../../../../components/logo/fullMotto';
import { LineDataProvider } from '../../controller/lineDataProvider';
import { LogoType } from '@nirvana/components/logo/full';
import NirvanaHeader from '../../components/header/index';
import NirvanaTerminal from '../terminal.tsx';

export default function NirvanaRouter() {
  const [selectedLineId, setSelectedLineId] = useRecoilState($selectedLineId);
  const [desktopMode, setDesktopMode] = useRecoilState($desktopMode);
  const numberOfOverlayColumns = useRecoilValue($numberActiveLines);
  const numberOfOverlayRows = useRecoilValue($maxNumberActiveStreams);

  // handle all window resizing logic
  useEffect(() => {
    // add dimensions if it's not overlay only mode
    let finalDimensions: Dimensions = { height: 0, width: 0 };
    let finalPosition: 'center' | 'topRight';

    const setAlwaysOnTop = desktopMode === 'overlayOnly';

    // go hunting for which dimensions to have
    if (desktopMode === 'terminal' || desktopMode == 'flowState') {
      finalDimensions = DEFAULT_APP_PRESET;
    }

    if (desktopMode === 'overlayOnly') {
      finalDimensions = {
        height: 68 + numberOfOverlayRows * 200,
        width: 360 + 360 * numberOfOverlayColumns,
      };
    }

    console.log(
      'setting new dimensions',
      desktopMode,
      numberOfOverlayColumns,
      numberOfOverlayRows,
      finalDimensions,
      setAlwaysOnTop
    );

    // send the final dimensions to main process
    window.electronAPI.window.resizeWindow({
      setAlwaysOnTop,
      dimensions: {
        height: finalDimensions.height,
        width: finalDimensions.width,
      },
      setPosition: finalPosition,
      addDimensions: false,
    });
  }, [desktopMode, numberOfOverlayColumns, numberOfOverlayRows]);

  // on window blur, put app in overlay only mode
  // get rid of selected line from terminal if we had any...

  useEffect(() => {
    window.electronAPI.on(Channels.ON_WINDOW_BLUR, () => {
      console.log(
        'window blurring now, should be always on top and then ill tell main process to change dimensions'
      );
      // TODO: testing mode... uncomment both instructions below
      // setDesktopMode("overlayOnly");

      // todo: make sure that if I am toggle broadcasted into a line, then don't deselect selected line
      // the overlay should be showing selected line if I am broadcasting toggled into it as well as of course all other toggle tuned ones
      // setSelectedLineId(null);
    });
  }, [setDesktopMode, setSelectedLineId]);

  return (
    <div className='flex flex-col flex-1'>
      <NirvanaHeader onHeaderFocus={() => setDesktopMode('terminal')} />

      {desktopMode === 'flowState' && <FlowState />}

      {/* remount nirvana terminal */}
      {(desktopMode === 'terminal' || desktopMode === 'overlayOnly') && (
        <LineDataProvider>
          <NirvanaTerminal overlayOnly={desktopMode === 'overlayOnly'} />
        </LineDataProvider>
      )}
    </div>
  );
}

type Quote = {
  content: string;
  author: string;
  length: number;
  dateAdded: Date;
  _id: string;
  tags: string[];
};
function FlowState() {
  const [quote, setQuote] = useState<Quote>(null);

  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then((res) => res.json())
      .then((data: Quote) => {
        console.warn(data);

        setQuote(data);
      })
      .catch((error) => {
        // do nothing, don't bother user, just don't show the quote
        console.warn(error);
      });
  }, []);

  return (
    <div className='flex flex-col flex-1 justify-center items-center relative'>
      {/* <img src="https://source.unsplash.com/random/?nature" /> */}
      <FullMottoLogo
        type={LogoType.small}
        className={'absolute bottom-2 mx-auto'}
      />

      {quote && (
        <span className='flex flex-col justify-center items-center max-w-screen-sm'>
          <span className='text-xl text-gray-800 font-semibold text-center'>
            "{quote.content}"
          </span>
          <span className='tex-md italic text-gray-400'>{quote.author}</span>
        </span>
      )}
    </div>
  );
}
