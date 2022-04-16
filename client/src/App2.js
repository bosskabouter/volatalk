import React, { useState, useEffect } from "react";


import logo from "./logo.svg";
import "./App.css";
import UserDisplay from "./components/UserDisplay";
import PeerDisplay from "./components/PeerDisplay";
import PushSubscribe from "./components/PushSubscribe";

let connOpts = {
  host: "www.volatalk.org",
  port: 8443,
  path: "/peerjs",
  secure: true,
  key: "pmkey",
  debug: 1,
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {loading === false ? (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Menu</h1>
            <UserDisplay></UserDisplay>
            <PeerDisplay opts={connOpts}></PeerDisplay>
            <PushSubscribe></PushSubscribe>
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
