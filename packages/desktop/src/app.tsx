import './styles/index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ElectronApp from './tree/electronApp';

function render() {
  ReactDOM.render(<ElectronApp />, document.getElementById('root'));
}

render();
