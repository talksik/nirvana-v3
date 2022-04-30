import { Conversation } from "../packages/core/models/conversation.model";
import { User } from "@nirvana/core/models";
import { useEffect } from "react";
import { useQuery } from "react-query";

interface LineData {
  lineInfo: Conversation;
  members: User[];

  blocks: { id: string; type: "audio" | "link"; content: { mediaUrl: string } };

  // is there activity right now
  isActive?: boolean;
  isUserActive?: boolean;

  isUserToggleTuned?: boolean;

  isFetching: boolean;

  broadcastSettings: {
    method: "toggle" | "push_to_talk";
    lineId: string;
  };
}

export default function useLinesData() {
  const linesData: LineData[] = [{} as LineData];

  // TODO: iterate on this to allow getting only relevant
  // lines so that the frontend isn't subscribing to a 100 socket io rooms
  // const basicLinesData = useQuery()

  /**
   * INCOMING SOCKET
   * DATA HANDLERS
   * these can be used to make changes or use refetch
   */
  useEffect(() => {
    // socket.on => handler
  });

  // transform the data as needed for a perfectly readable format for
  // the line details and overlay components
  // frontend needs to know the order of the lines
  // do the ordering in the lines list, but at least provide data here
  // like is there one line with someone talking in

  // include the loading, and other things of the useQuery of the initial one
  // pass in a modified refetch...we want to make sure sockets know when we do refetches
  // include which one I am broadcasting to

  return linesData;
}

// don't export this...only should be exposed through the line data?
// nahhh will re-render children who are subscribing to useLinesData even though
// they have nothing to do with the entire object...could use a context provider instead?

// need to figure out how to use this hook in line details
// and at the same time, update the useLinesData hook...need to send it up there or something
function useDetailedLineData(lineId: string) {
  // set initial data as a prop for this query using the data from the above
  // main hook
  // const x = useQuery(api.getLineData(pagination, etc..))

  // return the react query query itself
  return;
}

export function useLinesContext() {
  return {};
}
