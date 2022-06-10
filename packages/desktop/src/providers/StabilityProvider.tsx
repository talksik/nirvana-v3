import React, { useContext, useEffect, useState } from 'react';
import { useAsyncFn, useAsyncRetry } from 'react-use';

import { serverCheck } from '../api/NirvanaApi';

interface IStabilityContext {
  isServerHealthy: boolean;
}

const StabilityContext = React.createContext<IStabilityContext>({
  isServerHealthy: false,
});

export function StabilityProvider({ children }: { children: React.ReactNode }) {
  const state = useAsyncRetry(serverCheck, []);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // handle network connection
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
  }, [setIsOffline]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) state.retry();
    }, 5000);

    return () => clearInterval(interval);
  }, [state.loading]);

  if (isOffline)
    return (
      <div className="h-screen w-screen bg-white flex-1 flex flex-row justify-center items-center">
        <span>{'poor network connection... :('}</span>{' '}
      </div>
    );

  if (state.error)
    return (
      <div className="h-screen w-screen text-gray-400 bg-white flex-1 flex flex-col justify-center items-center">
        <span>{'sorry this is our bad. servers are rebooting... :('}</span>
        <br />
        <span>{'try refresh or restart application'}</span>
        <br />
        <span>{'call me for emergencies : (949)237-2715'}</span>
      </div>
    );

  return (
    <StabilityContext.Provider value={{ isServerHealthy: true }}>
      {children}
    </StabilityContext.Provider>
  );
}

export default function useStabilityContext() {
  return useContext(StabilityContext);
}
