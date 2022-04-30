import "./index.css";
import "./carbon.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import NirvanaApp from "./nirvanaApp";

function render() {
  ReactDOM.render(<NirvanaApp />, document.getElementById("root"));
}

render();
