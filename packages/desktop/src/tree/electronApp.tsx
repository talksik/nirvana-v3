import { AuthProvider } from '../providers/AuthProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';
import { SocketProvider } from '../providers/SocketProvider';
import { StabilityProvider } from '../providers/StabilityProvider';
import { Toaster } from 'react-hot-toast';
import { ZenProvider } from '../providers/ZenProvider';

export default function ElectronApp() {
  return (
    <StabilityProvider>
      <ElectronProvider>
        <AuthProvider>
          <ProtectedRoute>
            <ZenProvider>
              <SocketProvider>
                <></>
              </SocketProvider>
            </ZenProvider>
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
