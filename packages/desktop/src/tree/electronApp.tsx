import React from 'react';
import { Toaster } from 'react-hot-toast';
import { RoomsProvider } from '../providers/RoomsProvider';
import { RealTimeRoomProvider } from '../providers/TerminalProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import { SocketProvider } from '../providers/SocketProvider';
import ProtectedRoute from './protected/ProtectedRoute';
import { StreamProvider } from '../providers/StreamProvider';

export default function ElectronApp() {
  return (
    <ElectronProvider>
      <AuthProvider>
        <ProtectedRoute>
          <SocketProvider>
            <RoomsProvider>
              <StreamProvider>
                <RealTimeRoomProvider>
                  <></>
                </RealTimeRoomProvider>
              </StreamProvider>
            </RoomsProvider>
          </SocketProvider>
        </ProtectedRoute>
      </AuthProvider>

      <Toaster
        position={'bottom-right'}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </ElectronProvider>
  );
}
