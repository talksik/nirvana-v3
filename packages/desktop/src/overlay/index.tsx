import "../index.css";
import "../carbon.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Button } from "carbon-components-react";

function render() {
  ReactDOM.render(
    <div>
      this is the overlay for video streams and conversations to be passed in
      <Button>yoo carbone what's up</Button>
    </div>,
    document.getElementById("root")
  );
}

render();
