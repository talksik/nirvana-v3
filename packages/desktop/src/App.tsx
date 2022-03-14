import "./App.css";

import { HashRouter, Route, Routes } from "react-router-dom";

import { Button } from "@mui/material";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logo from "./components/Logo";
import React from "react";
import logo from "./logo.svg";
import testConnection from "@nirvana/core";

testConnection();

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
