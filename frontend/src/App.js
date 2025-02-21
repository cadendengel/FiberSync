import React, { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';

function App() {
  //const [cookie] = useState(document.cookie);
  const [username, setUsername] = useState("");
  //const [password, setPassword] = "password"; //useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (enteredChat) {
      axios.get("http://localhost:5000/api/messages/all")
        .then((response) => setMessages(response.data)) // Set messages to the response data
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);

  // Passwords NYI
  const handleLogin = () => {
    axios.post("http://localhost:5000/api/users/create", { username: username })
    .then((response) => {
      setEnteredChat(true);
      console.log("User created:", response.data); // Debugging log
    })
    .catch((error) => {
      console.error("Error creating user:", error);
    });
  };

  // Send message to the backend
  const handleSendMessage = (chatEvent) => {
    axios.post("http://localhost:5000/api/messages/create", new ChatMessage(username, chatEvent))
    .then((response) => {
      console.log("Message sent to backend", response.data); // debug log
      setMessages((prevMessages) => [...prevMessages, response.data]); // Append new message
    })
    .catch((error) => console.error("Error sending message:", error));
  };

  // Delete message by ID (Button NYI)
  const handleDeleteMessage = (messageId) => {
    axios.delete("http://localhost:5000/api/messages/id", messageId)
    .then((response) => {
      console.log("Message deleted:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.filter(message => message.id !== messageId)); // Remove deleted message
    })
    .catch((error) => console.error("Error deleting message:", error));
  }   

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