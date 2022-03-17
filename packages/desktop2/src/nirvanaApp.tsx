import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import testConnection from "@nirvana/core";

testConnection();

// Create a client
const queryClient = new QueryClient();

function NirvanaApp() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              {/* <Route exact path="/profile/create" component={Sit} />
            <Route exact path="/profile/edit" component={Sit} /> */}
            </Routes>
          </div>
        </HashRouter>
      </QueryClientProvider>
    </>
  );
}

export default NirvanaApp;
