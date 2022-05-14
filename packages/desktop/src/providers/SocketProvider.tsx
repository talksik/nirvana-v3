import React, { useState, useEffect, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import useAuth from './AuthProvider';
import FlowState from '../tree/protected/FlowState';

interface ISocketProvider {
  $ws: Socket;

  handleFlowState?: () => void;
}

const SocketContext = React.createContext<ISocketProvider>({
  $ws: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { jwtToken } = useAuth();

  const [$ws, set$ws] = useState<Socket>(null);

  const [flowState, setFlowState] = useState<boolean>(false);

  useEffect(() => {
    if (!jwtToken) {
      set$ws(undefined);
      toast.error('no jwt token!!!');

      return;
    }

    const socketConnection = io('http://localhost:5000', {
      query: { token: jwtToken },
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      reconnection: false, // ! TESTING THE PROBLEM WITH RECONNECTION CLIENT LISTENERS NOT ACTIVATING
    });

    socketConnection.on('connect', () => {
      toast.success('sockets connected');
    });

    socketConnection.io.on('close', () => {
      console.error(
        'SOCKET | there was a problem with your app...connection closed likely due to idling or manual disconnect',
      );

      setFlowState(true);
      socketConnection.disconnect();
      socketConnection.removeAllListeners();
    });

    // client-side errors
    socketConnection.on('connect_error', (err) => {
      console.error(`SOCKETS | ${err.message}`);
      toast.error('sorry...this is our bad...please refresh with cmd + r');
      set$ws(null);
    });

    set$ws(socketConnection);

    return () => {
      socketConnection.disconnect();
      socketConnection.removeAllListeners();
    };
  }, [set$ws, jwtToken]);

  const handleFlowState = useCallback(() => {
    setFlowState(true);

    $ws.disconnect();
    $ws.removeAllListeners();
  }, [setFlowState, $ws]);

  const handleReconnect = useCallback(() => {
    setFlowState(false);

    $ws.connect();
  }, [setFlowState, $ws]);

  if (!$ws) {
    return (
      <div className="h-screen w-screen justify-center items-center bg-white flex flex-col">
        <span className="text-gray-400">
          {
            "Please wait for a solid connection. If that doesn't work, please click below or restart the application."
          }
        </span>
        <button onClick={handleReconnect}>Reconnect</button>
      </div>
    );
  }

  if (flowState) {
    return <FlowState handleReconnect={handleReconnect} />;
  }

  return (
    <SocketContext.Provider value={{ $ws, handleFlowState }}>{children}</SocketContext.Provider>
  );
}

export default function useSockets() {
  return useContext(SocketContext);
}
