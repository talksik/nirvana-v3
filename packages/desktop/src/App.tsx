import "./App.css";

import { Button } from "@mui/material";
import Logo from "./components/Logo";
import React from "react";
import logo from "./logo.svg";
import testConnection from "@nirvana/core";

testConnection();

function App() {
  return (
    <div className="container flex flex-col space-y-5 mx-auto my-auto justify-center h-screen">
      <Logo />
      <Button variant="contained">Sign In</Button>
    </div>
  );
}

export default App;
