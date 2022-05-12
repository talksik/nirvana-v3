import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ReactQueryDevtools } from 'react-query/devtools';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';
import { configure } from 'react-hotkeys';
import testConnection from '@nirvana/core';
import NirvanaRouter from './router';
import ProtectedRoute from '../components/ProtectedRoute';

testConnection();

configure({
  // TODO: put back to default from docs: https://github.com/greena13/react-hotkeys#Configuration

  /**
   * The HTML tags that React HotKeys should ignore key events from. This only works
   * if you are using the default ignoreEventsCondition function.
   * @type {String[]}
   */
  ignoreTags: [],

  /**
   * The function used to determine whether a key event should be ignored by React
   * Hotkeys. By default, keyboard events originating elements with a tag name in
   * ignoreTags, or a isContentEditable property of true, are ignored.
   *
   * @type {Function<KeyboardEvent>}
   */
  // ignoreEventsCondition: function,
});

// Create a client
export const queryClient = new QueryClient();

function NirvanaApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ProtectedRoute>
          <NirvanaRouter />
        </ProtectedRoute>

        <ReactQueryDevtools initialIsOpen position='bottom-left' />
      </RecoilRoot>

      <Toaster
        position='bottom-right'
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default NirvanaApp;
