import React, { useState, useEffect } from "react";
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
// CADEN: still need to handle connection to backend via routes

function App() {
  const [username, setUsername] = useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (enteredChat) {
      fetch("http://127.0.0.1:5000/api/messages")
        .then((response) => response.json())
        .then((data) => setMessages(data))
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);


  const handleLogin = (username, password, cookie) => {
    if (cookie) {
      setEnteredChat(true);
      return;
    }
    if (username === "admin" && password === "password") { // CADEN: THIS LINE IS TEMPORARY, WILL GET FROM DB AND IMPLEMENT LOGIC LATER
      setEnteredChat(true);
    }
    setEnteredChat(true);
  };

  // Sends messages to the correct route
  const handleSendMessage = (chatEvent) => {
  if (!chatEvent.text || !chatEvent.text.trim()) return;

  fetch("http://127.0.0.1:5000/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatEvent),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Message received from backend:", data);  // Debugging log
    setMessages((prevMessages) => [...prevMessages, data]); // Append new message
  })
  .catch((error) => console.error("Error sending message:", error));
};


  return (
    <div className="container">
      {!enteredChat ? (
        <div className="entry-box">
          <img src={logo} alt="FiberSync Logo" className="logo" />
          <h1>FiberSync</h1>
          <input
            type="text"
            className="username-input"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} // Allow pressing Enter to proceed
          />
          <button className="enter-button" onClick={handleLogin}>➡</button>
        </div>
      ) : (
        <div className="chat-layout">
          <ChannelSidebar />
          <div className="chat-main">
            <ChatWindow messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
          <UserSidebar username={username} />
        </div>
      )}
    </div>
  );
  }

  export default App;