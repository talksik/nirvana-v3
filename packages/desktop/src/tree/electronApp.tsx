import { AuthProvider } from '../providers/AuthProvider';
import { ConversationProvider } from '../providers/ConversationProvider';
import { ElectronProvider } from '../providers/ElectronProvider';
import { NirvanaTheme } from '../mui/NirvanaTheme';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';
import { RouterProvider } from '../providers/RouterProvider';
import { SearchProvider } from '../providers/SearchProvider';
import { SocketProvider } from '../providers/SocketProvider';
import { StabilityProvider } from '../providers/StabilityProvider';
import Terminal from './Terminal';
import { ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { ZenProvider } from '../providers/ZenProvider';

export default function ElectronApp() {
  return (
    <ThemeProvider theme={NirvanaTheme}>
      <StabilityProvider>
        <ElectronProvider>
          <AuthProvider>
            <ProtectedRoute>
              <ZenProvider>
                <SocketProvider>
                  <ConversationProvider>
                    <SearchProvider>
                      <RouterProvider>
                        <Terminal />
                      </RouterProvider>
                    </SearchProvider>
                  </ConversationProvider>
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
    </ThemeProvider>
  );
}
