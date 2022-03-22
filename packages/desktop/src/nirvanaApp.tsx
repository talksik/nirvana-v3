import { QueryClient, QueryClientProvider } from "react-query";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
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
        <RecoilRoot>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
          <ReactQueryDevtools initialIsOpen={true} position={"bottom-left"} />
        </RecoilRoot>
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
