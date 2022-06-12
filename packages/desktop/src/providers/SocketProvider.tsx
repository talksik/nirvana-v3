import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import toast from 'react-hot-toast';
import useAuth from './AuthProvider';

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

  const initiateSocketStabilityListeners = useCallback(
    (socketConnection: Socket) => {
      socketConnection.on('connect', () => {
        toast.success('sockets connected');
      });

      socketConnection.io.on('close', () => {
        console.error('SOCKET | connection closed likely due to idling or manual disconnect');
        toast('unplugging');

        socketConnection.disconnect();
        set$ws(undefined);
      });

      // client-side errors
      socketConnection.on('connect_error', (err) => {
        console.error(`SOCKETS | ${err.message}`);
        toast.error('sorry...this is our bad...please refresh with cmd + r');
      });
    },
    [set$ws],
  );

  useEffect(() => {
    if (!jwtToken) {
      set$ws(undefined);
      toast.error('no jwt token!!!');

      return;
    }

    const socketConnection = io('http://localhost:8080', {
      query: { token: jwtToken },
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      reconnection: false, // ! TESTING THE PROBLEM WITH RECONNECTION CLIENT LISTENERS NOT ACTIVATING
    });

    initiateSocketStabilityListeners(socketConnection);
    set$ws(socketConnection);

    return () => {
      socketConnection.disconnect();
      socketConnection.removeAllListeners();
    };
  }, [set$ws, jwtToken, initiateSocketStabilityListeners]);

  const handleReconnect = useCallback(() => {
    initiateSocketStabilityListeners($ws);
    $ws.connect();
  }, [$ws, initiateSocketStabilityListeners]);

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

  return <SocketContext.Provider value={{ $ws }}>{children}</SocketContext.Provider>;
}

export default function useSockets() {
  return useContext(SocketContext);
}
