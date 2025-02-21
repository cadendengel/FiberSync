import React, { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
import ChatMessage from './src/ChatMessage';

function App() {
  //const [cookie] = useState(document.cookie);
  const [username, setUsername] = useState("");
  //const [password, setPassword] = "password"; //useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState([
    new ChatMessage("User1", "Hello!"),
    new ChatMessage("User2", "Welcome to FiberSync!")
  ]);
  useEffect(() => {
    if (enteredChat) {
      axios.get('http://localhost:5000/api/messages') // get & parse JSON from backend via axios
        .then((response) => { 
          console.log("Messages received from backend:"), // Debugging log
          setMessages(response.data); // Set messages to the response data
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);


  // CADEN: For the first sprint, we will not be implementing password authentication
  // instead we will be using the username as the only form of authentication
  const handleLogin = () => {
    axios.post("http://localhost:5000/api/users/create", { username })
    .then((response) => {
      console.log("User created:", response.data); // Debugging log
      setEnteredChat(true);
    })
    .catch((error) => {
      console.error("Error creating user:", error);
    });
  };

  // Send message to the backend
  const handleSendMessage = (chatEvent) => {
    // empty chat events are handled elsewhere
    axios.post("http://localhost:5000/api/messages", chatEvent)
    .then((response) => {
      console.log("Message sent to backend", response.data); // debug log
      setMessages((prevMessages) => [...prevMessages, response.data]); // Append new message
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