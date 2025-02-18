import React, { useState } from 'react';
import './App.css';
import logo from './FiberSyncLogo.png'; // Ensure the logo image is in /src
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState([
    { type: "message", user: "User1", text: "Hello!", timestamp: new Date().toISOString(), messageid: uuidv4() },
    { type: "message", user: "User2", text: "Welcome to FiberSync!", timestamp: new Date().toISOString(), messageid: uuidv4() }
  ]);

  const handleClick = () => {
    setEnteredChat(true);
  };

  const handleSendMessage = (messageText) => {
    if (!messageText || !messageText.trim()) return;
    
    const chatEvent = {
      type: "message",
      user: "You",
      text: messageText,
      timestamp: new Date().toISOString(),
      messageid: uuidv4()
    };
    
    setMessages(prevMessages => [...prevMessages, chatEvent]);
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
          <ChannelSidebar />
          <div className="chat-main">
            <ChatWindow messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
          <UserSidebar />
        </div>
      )}
    </div>
  );
}

export default App;
