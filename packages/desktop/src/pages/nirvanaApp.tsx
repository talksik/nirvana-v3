import { QueryClient, QueryClientProvider } from "react-query";

import NirvanaRouter from "./router";
import ProtectedRoute from "../components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import { configure } from "react-hotkeys";
import { io } from "socket.io-client";
import testConnection from "@nirvana/core";

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
    <>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <ProtectedRoute>
            <NirvanaRouter />
          </ProtectedRoute>

          <ReactQueryDevtools initialIsOpen={true} position={"bottom-left"} />
        </RecoilRoot>

        <Toaster />
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
