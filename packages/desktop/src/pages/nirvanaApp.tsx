import { QueryClient, QueryClientProvider } from "react-query";

import { GlobalTheme } from "@carbon/react";
import Login from "./Login";
import NirvanaRouter from "./router";
import ProtectedRoute from "../components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import testConnection from "@nirvana/core";

testConnection();

// Create a client
export const queryClient = new QueryClient();

export const socket = io("http://localhost:5000");

function NirvanaApp() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GlobalTheme theme="white">
          <RecoilRoot>
            <ProtectedRoute>
              <NirvanaRouter />
            </ProtectedRoute>
            <ReactQueryDevtools initialIsOpen={true} position={"bottom-left"} />
          </RecoilRoot>
        </GlobalTheme>
        <Toaster />
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
