import React, { useContext } from 'react';
import { useAsync } from 'react-use';
import { getUserLines } from '../api/NirvanaApi';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import GetUserLinesResponse from '@nirvana/core/responses/getUserLines.response';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';

/**
 * NOTE: lines, rooms, conversations are synonymous
 */

interface IRoomProvider {
  rooms?: AsyncState<NirvanaResponse<GetUserLinesResponse>>;
}

const RoomsContext = React.createContext<IRoomProvider>({});

/**
 * in charge of the main cach object for room data
 * modified with real time socket data
 */
export function RoomsProvider({ children }: { children: React.ReactChild }) {
  const rooms = useAsync(getUserLines);

  // TODO: refetch handler

  return <RoomsContext.Provider value={{ rooms }}>{children}</RoomsContext.Provider>;
}

export default function useRooms() {
  return useContext(RoomsContext);
}
