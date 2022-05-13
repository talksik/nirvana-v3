import React from 'react';

import { ElectronProvider } from '../providers/ElectronProvider';
import SocketProvider from '../providers/SocketProvider';

export default function ElectronApp() {
  return (
    <ElectronProvider>
      <SocketProvider>
        <div> this is the bottom of the tree</div>
      </SocketProvider>
    </ElectronProvider>
  );
}
