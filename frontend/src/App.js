import React, { useState, useEffect } from "react";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [hasUpdatedStatus, setHasUpdatedStatus] = useState(false);

  useEffect(() => {
    if (enteredChat) {
      axios.get("http://127.0.0.1:5000/api/messages/all")
        .then((response) => setMessages(response.data)) // Set messages to the response data
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [enteredChat]);


  // Clear the database, will be accessible from the inspect element console for now
  const clearUserDB = () => {
    axios.delete("http://127.0.0.1:5000/api/users")
    .then((response) => console.log("Database cleared:", response.data)) // Debugging log
    .catch((error) => console.error("Error clearing database:", error));
  }
  window.clearUserDB = clearUserDB; // Expose the function to the window object

  // Handle closing of the window and final update of user status to offline
  window.addEventListener("beforeunload", (ev) => {
    if (hasUpdatedStatus) return; // Skip if status has already been updated
    setHasUpdatedStatus(true); // Set flag to prevent multiple updates

    // Update user status
    if (enteredChat) {
      axios.post("http://127.0.0.1:5000/api/user-status", { username, status: "offline" })
        .then((response) => console.log("User status updated:", response.data)) // Debugging log
        .catch((error) => console.error("Error updating user status:", error));
        // pause web page close
        ev.preventDefault();
    }
  });

  // Check if the user has a valid session cookie
  const cookieCheck = () => {
    // Check if the current sessionID in document.cookie is valid
    axios.post("http://127.0.0.1:5000/api/users/authentication/cookies", { cookies: document.cookie })
    .then((response) => {
      console.log("User authenticated via cookies:", response.data); // Debugging log
      setUsername(response.data.username);
      setEnteredChat(true); // Enter the chat 
      return;
    })
    .catch((error) => {
      console.error("Cookies are invalid:", error);
      document.cookie = `sessionID=${uuidv4()}; browser=${window.navigator.userAgent}; expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
    })
  }

  // Main login function
  const handleLogin = () => {
    if (isNewUser) {
      document.cookie = `sessionID=${uuidv4()}; browser=${window.navigator.userAgent}; expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
      axios.post("http://127.0.0.1:5000/api/users/create", { username, password, cookie: document.cookie })
      .then((response) => {
        console.log("User created:", response.data); // Debugging log
        setEnteredChat(true); // Enter the chat
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        alert("Username already exists."); // Alert the user of the error
      })
    } else {
      axios.post("http://127.0.0.1:5000/api/users/login", { username, password, cookie: document.cookie })
      .then((response) => {
        console.log("User logged in:", response.data); // Debugging log
        setEnteredChat(true);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Invalid username or password."); // Alert the user of the error
      })
    }

    // Pre-login priming of user sidebar info
    // This is the best place I could put it,
    // even though it doesn't really belong here
    axios.get('http://127.0.0.1:5000/api/users')
      .then((response) => {
        const data = response.data
        const users = [];
      for (let i = 0; i < data.length; i += 2) {
        console.log(data[i], data[i + 1]);
        if (data[i] !== username)
          users.push({ username: data[i], status: data[i + 1] });
      }
      setUsers(users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  // Send message to the backend
  const handleSendMessage = (chatEvent) => {
    axios.post("http://127.0.0.1:5000/api/messages/create", new ChatMessage(username, chatEvent))
    .then((response) => {
      console.log("Message sent to backend", response.data); // debug log
      setMessages((prevMessages) => [...prevMessages, response.data]); // Append new message
    })
    .catch((error) => console.error("Error sending message:", error));
  };

  // Delete message by ID (Button NYI)
  const handleDeleteMessage = (messageId) => {
    axios.delete("http://127.0.0.1:5000/api/messages/id", messageId)
    .then((response) => {
      console.log("Message deleted:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.filter(message => message.id !== messageId)); // Remove deleted message
    })
    .catch((error) => console.error("Error deleting message:", error));
  }   

  // Edit message by ID (Button NYI)
  const handleEditMessage = (messageId, newText) => {
    axios.put("http://127.0.0.1:5000/api/messages/id", { id: messageId, text: newText })
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
          <img src={logo} alt="FiberSync Logo" className="logo" onClick={cookieCheck}/>
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
          <UserSidebar users={users} />
        </div>
      )}
    </div>
  );
  }

  export default App;