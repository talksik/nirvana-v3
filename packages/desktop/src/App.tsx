import "./App.css";

import { Button } from "@mui/material";
import Login from "./pages/Login";
import Logo from "./components/Logo";
import React from "react";
import logo from "./logo.svg";
import testConnection from "@nirvana/core";

testConnection();

function App() {
  return (
    <>
      <Login />
    </>
  );
}

export default App;
