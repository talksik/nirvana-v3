import './App.css';

import React from 'react';
import logo from './logo.svg';
import testConnection from '@nirvana/core';

testConnection()

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className=" text-lg">
          Edit <code>src/App.tsx</code> awoahhh
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
