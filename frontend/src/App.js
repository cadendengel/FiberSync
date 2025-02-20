import React, { useState, useEffect } from "react";
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
// CADEN: still need to handle connection to backend via routes

function App() {
  const [cookie] = useState(document.cookie);
  const [username, setUsername] = useState("");
  const [password, setPassword] = "password"; //useState("");
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


  const handleLogin = () => {
    // CADEN: For the first sprint, we will not be implementing password authentication
    //        instead we will be using the username as the only form of authentication
    fetch("http://127.0.0.1:5000/api/users/create", {
      mode: 'no-cors',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("User created successfully:", data); // Debugging log
      setEnteredChat(true);
    })
    .catch((error) => console.error("Error creating user:", error));
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

          {/*
          // CADEN: Password authentication will not yet implemented
          <input
            type="password"
            className="password-input"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            //onKeyDown={(e) => e.key === "Enter" && handleLogin()} // Allow pressing Enter to proceed
          />
          */}

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