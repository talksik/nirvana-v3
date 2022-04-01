import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import testConnection from "@nirvana/core";

testConnection();

// Create a client
export const queryClient = new QueryClient();

export const socket = io("http://localhost:5000");

const darkTheme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#438E86",
    },
    secondary: {
      main: "#FFB6B6",
    },
  },
});

function NirvanaApp() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <RecoilRoot>
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
            <ReactQueryDevtools initialIsOpen={true} position={"bottom-left"} />
          </RecoilRoot>

          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
