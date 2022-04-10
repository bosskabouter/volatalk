import React, { useState, useEffect } from "react";

import logo from "./logo.svg";
import "./App.css";


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 6000);
  }, []);

  return (
    <>
      {loading === false ? (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Menu</h1>

            <p></p>
          </header>
        </div>
      ) : (
          <div>
                      <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>VolaTALK</h1>

            <p>Private, Direct Messaging</p>
            <em>Connecting...</em>
          </header>
            </div>
      )}
    </>
  );
}

export default App;
