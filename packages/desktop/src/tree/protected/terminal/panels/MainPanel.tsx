import useAuth from '../../../../providers/AuthProvider';

import NewChannelForm from '../compose/NewChannelForm';
import LineDetails from '../line/LineDetails';
import useTerminalProvider from '../../../../providers/TerminalProvider';

import React from 'react';

export default function MainPanel() {
  const { user } = useAuth();

  const { selectedLineId, showNewChannelForm, handleShowNewChannelForm } = useTerminalProvider();

  // already won't see stuff for overlay only mode as per parent configuration

  // TODO: if there is stuff in search, show that first

  if (showNewChannelForm)
    return <NewChannelForm handleClose={() => handleShowNewChannelForm('hide')} />;

  // if selected line, show line details
  if (selectedLineId) return <LineDetails />;

  // else show the stale state

  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-white">
      <span className="text-xl text-gray-800">{`Hi ${user.givenName}!`}</span>
      <span className="text-md text-gray-400">{"You're all set!"}</span>
    </div>
  );
}
