import React from 'react';
import { Toaster } from 'react-hot-toast';
import { RoomsProvider } from '../providers/RoomsProvider';
import { RealTimeRoomProvider } from '../providers/RealTimeRoomProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import { SocketProvider } from '../providers/SocketProvider';
import ProtectedRoute from './protected/ProtectedRoute';
import Terminal from './protected/terminal/Terminal';

export default function ElectronApp() {
  return (
    <ElectronProvider>
      <AuthProvider>
        <ProtectedRoute>
          <SocketProvider>
            <RoomsProvider>
              <RealTimeRoomProvider>
                <Terminal />
              </RealTimeRoomProvider>
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
