import React, { useState } from 'react';
import './App.css';
import logo from './FiberSyncLogo.png'; // Ensure the logo image is in /src

function App() {
  const [enteredChat, setEnteredChat] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = () => {
    setEnteredChat(true);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    console.log("Message submitted:", message);
    setMessage("");
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
          {/* Left Panel - Channels */}
          <div className="chat-sidebar">
            <h2>Channels</h2>
            <ul className="channel-list">
              <li>#Primary</li>
              <li>#Project Complaining</li>
              <li>#Dr. Lehr rumors</li>
              <li>#Social</li>
            </ul>
          </div>

          {/* Center Chat Window */}
          <div className="chat-window">
            <h2>Chat Messages</h2>
            <div className="chat-messages">
              <p><strong>User1:</strong> Hello!</p>
              <p><strong>User2:</strong> Welcome to FiberSync!</p>
            </div>
            {/* Chat Box Input, sub Div of Chat Window */}
            <div className="chatbox">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={message} 
                onChange={handleMessageChange} 
                className="chat-input" 
              />
              <button onClick={handleSendMessage} className="send-button">Send</button>
            </div>
          </div>

          {/* Right Panel - Users */}
          <div className="chat-sidebar">
            <h2>Users</h2>
            <ul className="user-list">
              <li>👤 User1</li>
              <li>👤 User2</li>
              <li>👤 User (You)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
