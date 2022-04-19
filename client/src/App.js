import React from 'react';
import logo from './logo.svg';
import './App.css';
import PushSubscribe from './components/PushSubscribe';
import UserDisplay from './components/UserDisplay';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <UserDisplay></UserDisplay>
        <PushSubscribe></PushSubscribe>
      </header>
    </div>
  );
}

export default App;
