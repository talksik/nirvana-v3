import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";
import testConnection from "@nirvana/core";

testConnection();

// Create a client
export const queryClient = new QueryClient();

function NirvanaApp() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              {/* <Route exact path="/profile/create" component={Sit} />
            <Route exact path="/profile/edit" component={Sit} /> */}
            </Routes>
          </HashRouter>

          <ReactQueryDevtools initialIsOpen={false} />
        </RecoilRoot>
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
