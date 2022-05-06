import React, { useContext } from "react";

import $ws from "./sockets";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import SocketChannels from "@nirvana/core/sockets/channels";
import { User } from "@nirvana/core/models";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useUserLines } from "./index";

interface ILineDataContext {
  // represents the modified and up to date lines data with availability from session
  lines: MasterLineData[];
  relevantUsers: User[];
}

const lineDataContext = React.createContext<ILineDataContext>({
  lines: [],
  relevantUsers: [],
});

export function LineDataProvider() {
  // persistent store of lines
  const { data: basicUserLinesData } = useUserLines();

  // connect through ws to enrich basic lines data
  useEffect(() => {
    // $ws.on(SocketChannels.CONNECT, );
  }, [basicUserLinesData]);

  // get updated associations with certain lines
}

export function useLineDataProvider() {
  return useContext(lineDataContext);
}
