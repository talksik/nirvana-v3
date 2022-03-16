import "./App.css";

import { HashRouter, Route, Routes } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";

import Home from "./pages/Home";
import Login from "./pages/Login";
import testConnection from "@nirvana/core";

testConnection();

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              {/* <Route exact path="/profile/create" component={Sit} />
            <Route exact path="/profile/edit" component={Sit} /> */}
            </Routes>
          </div>
        </HashRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
