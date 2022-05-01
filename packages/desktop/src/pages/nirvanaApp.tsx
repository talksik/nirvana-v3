import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material";

import Login from "./Login";
import NirvanaRouter from "./router";
import ProtectedRoute from "../components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import { Toaster } from "react-hot-toast";
import io from "socket.io-client";
import testConnection from "@nirvana/core";

testConnection();

const theme = createTheme({
  palette: {
    primary: {
      main: "#438E86",
    },
    secondary: {
      main: "#161616",
    },
    info: {
      main: "#A8A8A8",
    },
  },
  typography: {
    fontFamily: "IBM Plex Sans",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 300,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
});

// Create a client
export const queryClient = new QueryClient();

export const socket = io("http://localhost:5000");

function NirvanaApp() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <ProtectedRoute>
              <NirvanaRouter />
            </ProtectedRoute>

            <ReactQueryDevtools
              initialIsOpen={false}
              position={"bottom-left"}
            />
          </RecoilRoot>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
