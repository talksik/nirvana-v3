import * as React from "react";
import * as ReactDOM from "react-dom";

import { HashRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

function render() {
  ReactDOM.render(
    <HashRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          {/* <Route exact path="/profile/create" component={Sit} />
            <Route exact path="/profile/edit" component={Sit} /> */}
        </Routes>
      </div>
    </HashRouter>,
    document.body
  );
}

render();
