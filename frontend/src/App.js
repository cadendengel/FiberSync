import React, { useState } from 'react';
import './App.css';
import logo from './FiberSyncLogo.png'; // Ensure the logo image is in /src
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
import ChatMessage from './src/ChatMessage';

function App() {
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState([
    new ChatMessage("User1", "Hello!"),
    new ChatMessage("User2", "Welcome to FiberSync!")
  ]);

  const handleClick = () => {
    setEnteredChat(true);
  };

  const handleSendMessage = (messageText) => {
    const chatEvent = new ChatMessage(username = "You", messageText); // get the real username when implemented
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
