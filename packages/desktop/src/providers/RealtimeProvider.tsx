import React, { useEffect } from 'react';
import { ServerResponseChannels, SomeoneTunedResponse } from '@nirvana/core/sockets/channels';

import { SomeoneConnectedResponse } from '@nirvana/core/sockets/channels';
import useSockets from './SocketProvider';

/**
 * Responsibility: provide real time feel of people presence
 *
 * Get to know when:
 * - me or someone else tunes or untunes from a conversation
 * - someone speaks in a chat for a conversation that I am tuned into
 * - there is new content in a channel that I am connected or tuned into
 * - someone in a chat that I am tuned into goes into flow state
 *
 *
 * Firing Events - this could be in the universe as a whole through a hook and doesn't need to be in here
 * - have helper async functions which take in a socket client and call the event
 * - on load, we need to join the particular rooms based on priority vs inbox
 * - move conversation to priority and back and mutate the conversation map
 *
 * Listening Events:
 * - have a useEffect that listens to all events and mutates conversation map accordingly
 * -
 */

const RealtimeContext = React.createContext({});

export function RealtimeProvider({ children }: { children }) {
  const { $ws } = useSockets();

  useEffect(() => {
    // $ws.on(ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE, (res: SomeoneConnectedResponse) => {
    // })
    // $ws.on(ServerResponseChannels.SOMEONE_TUNED_INTO_LINE, (res: SomeoneTunedResponse) => {
    // })
  }, [$ws]);

  return <RealtimeContext.Provider value={{}}>{children}</RealtimeContext.Provider>;
}
