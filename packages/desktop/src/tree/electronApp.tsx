import React from 'react';
import { Toaster } from 'react-hot-toast';
import { RoomsProvider } from '../providers/RoomsProvider';
import { TerminalProvider } from '../providers/TerminalProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import { SocketProvider } from '../providers/SocketProvider';
import ProtectedRoute from './protected/ProtectedRoute';
import { StabilityProvider } from '../providers/StabilityProvider';
export default function ElectronApp() {
  return (
    <StabilityProvider>
      <ElectronProvider>
        <AuthProvider>
          <ProtectedRoute>
            <SocketProvider>
              <RoomsProvider>
                <TerminalProvider>
                  <></>
                </TerminalProvider>
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
    </StabilityProvider>
  );
}
