import React from "react";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import PeerManager from "./components/PeerManager";

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");

const root = createRoot(container);

root.render(<App tab="home" />);

//root.render( <PeerManager />);

var peerOptions = {
  peerjs_key: "your peerjs key",
};
//ReactDOM.render(<PeerManager opts={peerOptions} />, App);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.debug);
