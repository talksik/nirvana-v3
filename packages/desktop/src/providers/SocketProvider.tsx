import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import useAuth from './AuthProvider';

interface ISocketProvider {
  $ws: Socket;
}

const SocketContext = React.createContext<ISocketProvider>({
  $ws: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { jwtToken } = useAuth();

  const [$ws, set$ws] = useState<Socket>(null);

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
    });

    // client-side errors
    socketConnection.on('connect_error', (err) => {
      console.error(`SOCKETS | ${err.message}`);
      toast.error('sorry...this is our bad...please refresh with cmd + r');
    });

    set$ws(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [set$ws, jwtToken]);

  if (!$ws) {
    return (
      <div className="h-screen w-screen justify-center items-center bg-white flex flex-col">
        <span className="text-gray-400">
          {
            "Please wait for a solid connection. If that doesn't work, please click below or restart the application."
          }
        </span>
        <button onClick={() => console.warn('NOT IMPLEMENTED...manual reconnect button')}>
          Reconnect
        </button>
      </div>
    );
  }

  return <SocketContext.Provider value={{ $ws }}>{children}</SocketContext.Provider>;
}

export default function useSockets() {
  return useContext(SocketContext);
}
