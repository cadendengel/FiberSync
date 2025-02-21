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
  const [messages, setMessages] = useState([
    new ChatMessage("User1", "Hello!"),
    new ChatMessage("User2", "Welcome to FiberSync!")
  ]);
  useEffect(() => {
    if (enteredChat) {
      axios.get('http://localhost:5000/api/messages') // get & parse JSON from backend via axios
        .then((response) => { 
          console.log("Messages received from backend:"); // Debugging log
          setMessages(response.data); // Set messages to the response data
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);

  /* // CHRIS: This is how I am attempting to rework the login function to use axios.
  // I have so far been unable to get it working, running into CORS errors.
  const handleLogin = () => {
    axios.post("http://localhost:5000/api/users/create", { name: username })
    .then((response) => {
      console.log("User created:", response.data); // Debugging log
      setEnteredChat(true);
    })
    .catch((error) => {
      console.error("Error creating user:", error);
    });
  };
  */

  // CADEN: For the first sprint, we will not be implementing password authentication
  // instead we will be using the username as the only form of authentication
  const handleLogin = () => {
    fetch("http://127.0.0.1:5000/api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username})
    })
    .then((data) => {
      console.log(data); // Debugging log
    })
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

  // Deletes message by ID (user can't do it yet)
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