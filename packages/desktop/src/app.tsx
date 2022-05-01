import "./styles/index.css";

import * as React from "react";
import * as ReactDOM from "react-dom";

import NirvanaApp from "./pages/nirvanaApp";

function render() {
  ReactDOM.render(<NirvanaApp />, document.getElementById("root"));
}

render();
