import React, { useState, useEffect, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface ISocketProvider {
  $ws: Socket;
}

const SocketContext = React.createContext<ISocketProvider>({
  $ws: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [$ws, set$ws] = useState<Socket>(null);

  useEffect(() => {
    const socketConnection = io('http://localhost:5000', {
      query: { token: jwtToken },
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      reconnection: false, // ! TESTING THE PROBLEM WITH RECONNECTION CLIENT LISTENERS NOT ACTIVATING
    });

    set$ws(socketConnection);
  }, [set$ws]);

  if (!$ws) return <span>please wait for a solid connection</span>;

  return <SocketContext.Provider value={{ $ws }}>{children}</SocketContext.Provider>;
}

export default function useSockets() {
  return useContext(SocketContext);
}
