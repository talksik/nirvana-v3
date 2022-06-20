import { Container, Typography } from '@mui/material';
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

  // server check refetching
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) state.retry();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.loading]);

  if (isOffline)
    return (
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: 'white',
        }}
      >
        <Typography variant="caption" align="center">
          {'poor network connection... :('}
        </Typography>
      </Container>
    );

  if (state.error)
    return (
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: 'white',
        }}
      >
        <Typography variant="caption" align="center">
          {
            'sorry this is our bad. servers are rebooting... :( call me for emergencies : (949)237-2715'
          }
        </Typography>
      </Container>
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
