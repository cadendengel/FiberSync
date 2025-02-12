import React, { useState } from 'react';
import './App.css';
import logo from './FiberSyncLogo.png'; // Make sure the logo image is in the src folder

function App() {
  const [enteredChat, setEnteredChat] = useState(false);

  const handleClick = () => {
    setEnteredChat(true);
  };

  return (
    <div className="container">
      {!enteredChat ? (
        <div className="entry-box" onClick={handleClick}>
          <img src={logo} alt="FiberSync Logo" className="logo" />
          <h1>FiberSync</h1>
        </div>
      ) : (
        <div className="chat-container">
          <h2>Welcome to the Chat</h2>
        </div>
      )}
    </div>
  );
}

export default App;
