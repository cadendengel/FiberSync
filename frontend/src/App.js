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
import { io } from "socket.io-client";

// Throwing down a bunch of comments to explain my changes:
/* Axios Requests: Now uses an environment variable to toggle between development & deployment
 *    - Development: `REACT_APP_BACKEND_URL=http://127.0.0.1:5000`
 *    - Deployment: `REACT_APP_BACKEND_URL=https://fibersync.onrender.com`
 * I am using a .env.production for Deployment, and a .env for Development
 *    - Ensures proper routing between development (localhost) and production (Render backend)
 */

/* WebSocket Connection: Handles Real-Time Messaging Syncing, I think Chris B might work on this a bit more as well?
 *    - Uses only WebSockets (no polling)
 *    - Auto-reconnects if disconnected
 */
const socket = io(process.env.REACT_APP_BACKEND_URL, { 
  transports: ["websocket"], // Enforce WebSocket only, prevent polling
  reconnection: true, 
  reconnectionAttempts: Infinity, 
  reconnectionDelay: 2000,  
  timeout: 20000, 
});

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [hasUpdatedStatus, setHasUpdatedStatus] = useState(false);

  const [activeChannel, setActiveChannel] = useState("Home"); // Home is now the default channel
  useEffect(() => {
    if (enteredChat) {
        console.log(`Switching to Channel: ${activeChannel}`); // Debugging log
        fetchMessages(activeChannel);

        // Leave any previous channel before joining the new one
        socket.emit("leave_channel");
        
        // Join the new channel
        socket.emit("join_channel", { channel: activeChannel });

      // Update user status to online
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username, status: "online" })
        .then((response) => console.log("User status updated:", response.data)) // Debugging log
        .catch((error) => console.error("Error updating user status:", error));

      // Fetch users for the sidebar
      fetchSidebar();
    }
  }, [enteredChat, activeChannel]);



    /* Fetch messages for the selected channel
   * Right now an error flags if you join a channel that doesn't have any messages yet, I think the best solution is to
   * just add a first message automatically like "Welcome to {Channel Name}!", or we can ignore the error
   */
    const fetchMessages = async (channel) => {
      try {
          setMessages([]);  
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/messages/${encodeURIComponent(channel)}`);
          setMessages(response.data);
      } catch (error) {
          console.error("Error fetching messages:", error);
      }
    };
  
  
  
    /* WebSocket Message Handling:
     *   - Listens for new messages from the backend and updates the chat in real-time, no need to manually refresh
     *   - Ensures messages persist correctly and don't duplicate
     */
    useEffect(() => {
      const handleNewMessage = (message) => {
          console.log(`New message received in ${message.channel}:`, message);
        
          if (message.channel === activeChannel) {  
              setMessages((prevMessages) => [...prevMessages, message]); 
          }
      };
  
      socket.on("receive_message", handleNewMessage);
  
      return () => {
        socket.off("receive_message", handleNewMessage);
      };
    }, [activeChannel]);
  
  
    const handleSendMessage = (chatEvent) => {
      const newMessage = { user: username, text: chatEvent, channel: activeChannel };
      socket.emit("send_message", newMessage);
    };

  // Clear the database, will be accessible from the inspect element console for now
  const clearUserDB = () => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users`)
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
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username, status: "offline" })
        .then((response) => console.log("User status updated:", response.data)) // Debugging log
        .catch((error) => console.error("Error updating user status:", error));
        // pause web page close
        ev.preventDefault();
    }
  });

  const fetchSidebar = () => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`)
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
    }

  // Check if the user has a valid session cookie
  const cookieLogin = () => {
    // Check if the current sessionID in document.cookie is valid
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/authentication/cookies`, { cookies: document.cookie })
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
      // generate new sessionID
      document.cookie = `sessionID=${uuidv4()}; browser=${window.navigator.userAgent}; expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/create`, { username, password, cookie: document.cookie })
      .then((response) => {
        console.log("User created:", response.data); // Debugging log
        setEnteredChat(true); // Enter the chat
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        alert("Username already exists."); // Alert the user of the error
      })
    } else {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, { username, password, cookie: document.cookie })
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


  /* The actual React app UI below: (or the important part)
   * Conditionally renders either the Login Screen (before entering chat) 
   *    OR the Chat Interface (once user has logged in).
   *      `enteredChat` state determines what gets displayed.
   * The chat interface updates dynamically based on user interactions.
   * More UI updates can be added based on user selection, channel switching, etc as
   */

  return (
    <div className="container">
      {!enteredChat ? (
        <div className="entry-box">
          <img src={logo} alt="FiberSync Logo" className="logo" onClick={cookieLogin}/>
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
          <ChannelSidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
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