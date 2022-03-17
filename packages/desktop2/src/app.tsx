import "./index.css";

import * as React from "react";
import * as ReactDOM from "react-dom";

function render() {
  ReactDOM.render(
    <h2 className="text-sm bg-black">Hello from React!</h2>,
    document.getElementById("root")
  );
}

render();
