import { Button, Container, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import toast from 'react-hot-toast';
import useAuth from './AuthProvider';
import { useUnmount } from 'react-use';

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
        // toast.success('sockets connected');
      });

      socketConnection.io.on('close', () => {
        console.error('SOCKET | connection closed likely due to idling or manual disconnect');
        toast('unplugging');

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

  const connect = useCallback(() => {
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
  }, [initiateSocketStabilityListeners, jwtToken, set$ws]);

  useEffect(() => {
    connect();
  }, [connect]);

  useUnmount(() => {
    $ws?.disconnect();
    $ws?.removeAllListeners();
  });

  const handleReconnect = useCallback(() => {
    connect();
  }, [connect]);

  if (!$ws) {
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
            "Please wait for a solid connection. If that doesn't work, please click below or restart the application."
          }
        </Typography>
        <Button variant={'text'} onClick={handleReconnect}>
          reconnect
        </Button>
      </Container>
    );
  }

  return <SocketContext.Provider value={{ $ws }}>{children}</SocketContext.Provider>;
}

export default function useSockets() {
  return useContext(SocketContext);
}
