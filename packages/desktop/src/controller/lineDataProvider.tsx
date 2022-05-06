import React, { useContext } from "react";

import { $jwtToken } from "./recoil";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import SocketChannels from "@nirvana/core/sockets/channels";
import { User } from "@nirvana/core/models";
import { io } from "socket.io-client";
import { queryClient } from "../pages/nirvanaApp";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useUserLines } from "./index";

interface ILineDataContext {
  // represents the modified and up to date lines data with availability from session
  lines: MasterLineData[];
  relevantUsers: User[];
}

const LineDataContext = React.createContext<ILineDataContext>({
  lines: [],
  relevantUsers: [],
});

let $ws;

export function LineDataProvider({ children }) {
  // persistent store of lines
  const { data: basicUserLinesData } = useUserLines();
  const jwtToken = useRecoilValue($jwtToken);

  useEffect(() => {
    $ws = io("http://localhost:5000", {
      query: { token: jwtToken },
    });

    // client-side errors
    $ws.on("connect_error", (err) => {
      console.error(err.message); // prints the message associated with the error
      toast.error("sorry...this is our bad...please refresh with cmd + r");

      // force refetch of server status as well as these generally go hand in hand

      // this should overall remount this component currently which is what we want for new data
      queryClient.invalidateQueries("SERVER_CHECK");
    });
  }, []);

  // connect through ws to enrich basic lines data
  useEffect(() => {
    console.log("got basic user lines data!!!");

    // ?need to calculate diff and only do stuff then?

    // $ws.on(SocketChannels.CONNECT, console.log());

    $ws.on("test", () => console.log("test"));
  }, [basicUserLinesData]);

  // get updated associations with certain lines

  return (
    <LineDataContext.Provider value={{} as ILineDataContext}>
      {children}
    </LineDataContext.Provider>
  );
}

export function useLineDataProvider() {
  return useContext(LineDataContext);
}
