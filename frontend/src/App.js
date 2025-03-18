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
  //const [cookie] = useState(document.cookie); // Not sure about this yet
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (enteredChat) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/messages/all`)
        .then((response) => setMessages(response.data)) // Set messages to the response data
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);

  // Clear the database, will be accessible from the inspect element console for now
  const clearUserDB = () => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users`)
    .then((response) => console.log("Database cleared:", response.data)) // Debugging log
    .catch((error) => console.error("Error clearing database:", error));
  }
  window.clearUserDB = clearUserDB; // Expose the function to the window object

  const handleLogin = () => {
    if (isNewUser) {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/create`, { username, password })
      .then((response) => {
        console.log("User created:", response.data); // Debugging log
        setEnteredChat(true); // Enter the chat
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        alert("Username already exists."); // Alert the user of the error
      })
    } else {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, { username, password })
      .then((response) => {
        console.log("User logged in:", response.data); // Debugging log
        setEnteredChat(true);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Invalid username or password."); // Alert the user of the error
      })
    }
  };

  // Send message to the backend
  const handleSendMessage = (chatEvent) => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/messages/create`, new ChatMessage(username, chatEvent))
    .then((response) => {
      console.log("Message sent to backend", response.data); // debug log
      setMessages((prevMessages) => [...prevMessages, response.data]); // Append new message
    })
    .catch((error) => console.error("Error sending message:", error));
  };

  // Delete message by ID (Button NYI)
  const handleDeleteMessage = (messageId) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/messages/id`, messageId)
    .then((response) => {
      console.log("Message deleted:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.filter(message => message.id !== messageId)); // Remove deleted message
    })
    .catch((error) => console.error("Error deleting message:", error));
  }   

  // Edit message by ID (Button NYI)
  const handleEditMessage = (messageId, newText) => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/messages/id`, { id: messageId, text: newText })
    .then((response) => {
      console.log("Message edited:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.map(message => message.id === messageId ? { ...message, text: newText } : message)); // Update message
    })
    .catch((error) => console.error("Error editing message:", error));
  }

  return (
    <div className="container">
      {!enteredChat ? (
        <div className="entry-box">
          <img src={logo} alt="FiberSync Logo" className="logo" />
          <h1>FiberSync</h1>
          <div className="switch-container">
            <label className="switch">
              <input type="checkbox" onClick={() => setIsNewUser(!isNewUser)} />
              <span className="slider round"></span>
            </label>
            <p>{isNewUser ? "Create new user" : "Login"}</p>
          </div>
          <input
            type="text"
            className="username-input"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <input
            type="password"
            className="password-input"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button className="enter-button" onClick={handleLogin}>➡</button>
        </div>
      ) : (
        <div className="chat-layout">
          <ChannelSidebar />
          <div className="chat-main">
            <ChatWindow messages={messages} onDeleteMessage={handleDeleteMessage} onEditMessage={handleEditMessage} />
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
          <UserSidebar username={username} />
        </div>
      )}
    </div>
  );
  }

  export default App;