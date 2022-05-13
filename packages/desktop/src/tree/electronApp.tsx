import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../providers/AuthProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import { SocketProvider } from '../providers/SocketProvider';
import ProtectedRoute from './protected/ProtectedRoute';

export default function ElectronApp() {
  return (
    <ElectronProvider>
      <AuthProvider>
        <ProtectedRoute>
          <SocketProvider>yo its connected dawg</SocketProvider>
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
