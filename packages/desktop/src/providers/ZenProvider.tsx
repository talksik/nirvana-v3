// handle the flow state and other things

import React, { useCallback, useContext, useState } from 'react';

import FlowState from '../tree/FlowState';

interface IZenContext {
  handleFlowState?: () => void;
}

const ZenContext = React.createContext<IZenContext>({});

export function ZenProvider({ children }: { children: React.ReactNode }) {
  const [flowState, setFlowState] = useState<boolean>(false);

  const handleFlowState = useCallback(() => {
    setFlowState(true);
  }, [setFlowState]);

  const handleReconnect = useCallback(() => {
    setFlowState(false);
  }, [setFlowState]);

  if (flowState) {
    return <FlowState handleReconnect={handleReconnect} />;
  }

  return <ZenContext.Provider value={{ handleFlowState }}>{children}</ZenContext.Provider>;
}

export default function useZen() {
  return useContext(ZenContext);
}
