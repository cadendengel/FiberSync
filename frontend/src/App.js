import React, { useState } from 'react';
import './App.css';
import logo from './FiberSyncLogo.png'; // Ensure the logo is in /src

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
        <div className="chat-layout">
          {/* Left Panel */}
          <div className="chat-sidebar">
            <h2>Channels</h2>
          </div>

          {/* Center Chat Window */}
          <div className="chat-window">
            <h2>Active Chat</h2>
            <div className="chat-messages">
              {/* Placeholder messages */}
              <p><strong>User1:</strong> Hello!</p>
              <p><strong>User2:</strong> Welcome to FiberSync!</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="chat-sidebar">
            <h2>Users</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
