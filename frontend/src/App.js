import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import logo from './resources/FiberSyncLogo.png';
import ChannelSidebar from './components/ChannelSidebar';
import ChatWindow from './components/ChatWindow';
import UserSidebar from './components/UserSidebar';
import ChatInput from './components/ChatInput';
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
  reconnectionAttempts: 3,
  reconnectionDelay: 3000,
  timeout: 20000,
  query: { username: "" } // needs to be updated with the username later on login
});

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enteredChat, setEnteredChat] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState("Home"); // Home is now the default channel
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [noMessagesToDelete, setNoMessagesToDelete] = useState(false);

  ///////////////////////////////
  //       DEVELOPER MODE        //
  ///////////////////////////////
  useEffect(() => {
    const handleKeyDown = (event) => {
      // WINDOWS: Check if Shift + Alt + P are pressed
      // MAC: Check if Option + Shift + P are pressed
      if ((event.shiftKey && event.altKey && event.key === "p") || event.key === '∏') {
        if (!isDeveloperMode) {
          // Enter Developer Mode: prompt for password
          const password = prompt("Enter Developer Mode Password:");
          if (password === "devpass") {
            setIsDeveloperMode(true);
          } else {
            alert("Incorrect password!");
          }
        } else {
          // Exit Developer Mode: no password needed
          setIsDeveloperMode(false);
        }
      }
    };
 
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeveloperMode]); // Dependency array to track changes in developer mode state
  
  // Base developer mode gateway
  const activateDevMode = () => {
    const password = prompt("Enter Developer Mode Password:");
    if (password === "devpass") {
      setIsDeveloperMode(true);
    } else {
      alert("Incorrect password!");
    }
  };

  // Deletes messages on all channels
  const handleDevDeleteAllMessages = async () => {
    if (messages.length === 0) {
      setNoMessagesToDelete(true); // Show "no messages" popup
      setTimeout(() => setNoMessagesToDelete(false), 3000); // Hide after 3s
      return;
    }
  
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/messages/all`);
      console.log("All messages deleted:", response.data);
      fetchMessages(activeChannel);
  
      setDeletionSuccess(true); // Show success popup
      setTimeout(() => setDeletionSuccess(false), 3000); // Hide after 3s
    } catch (error) {
      console.error("Error deleting all messages:", error);
    }
  };

  // deletes individual user
  const handleDevDeleteUser = async (usernameToDelete) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/${usernameToDelete}`);
      console.log(`User ${usernameToDelete} deleted`);
      // Refresh the user sidebar after deletion
      fetchSidebar();
    } catch (error) {
      console.error(`Error deleting user ${usernameToDelete}:`, error);
    }
  };
  
 
  
  /////////////////////////////////
  // MESSAGES/CHANNELS FUNCTIONS //
  /////////////////////////////////

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

  
    // Send message
    const handleSendMessage = (chatEvent) => {
      const newMessage = { user: username, text: chatEvent, channel: activeChannel };
      socket.emit("send_message", newMessage);
    };


    // Delete message by ID
  const handleDeleteMessage = (messageId) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/messages/id`, messageId)
    .then((response) => {
      console.log("Message deleted:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.filter(message => message.id !== messageId)); // Remove deleted message
    })
    .catch((error) => console.error("Error deleting message:", error));
  };


  // Edit message by ID
  const handleEditMessage = (messageId, newText) => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/messages/id`, { id: messageId, text: newText })
    .then((response) => {
      console.log("Message edited:", response.data); // Debugging log
      setMessages((prevMessages) => prevMessages.map(message => message.id === messageId ? { ...message, text: newText } : message)); // Update message
    })
    .catch((error) => console.error("Error editing message:", error));
  };

  
  ////////////////////////////
  // USER_SIDEBAR FUNCTIONS //
  ////////////////////////////

  // Fetch the user list for the sidebar
  const fetchSidebar = useCallback(() => {
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
    }, [username]);
  

  /////////////////////
  // LOGIN FUNCTIONS //
  /////////////////////

  // Check if the user has a valid session cookie
  const cookieLogin = () => {
    // Check if the current sessionID in document.cookie is valid
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/authentication/cookies`, { cookie: document.cookie })
    .then((response) => {
      console.log("User authenticated via cookies:", response.data); // Debugging log
      setUsername(response.data.username);

      // Update user status to online
      //socket.emit("user_status", { username: response.data.username, status: "online" });
      
      
      /*
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username: response.data.username, status: "online" })
      .then((response) => console.log("User status updated:", response.data)) // Debugging log
      .catch((error) => console.error("Error updating user status:", error));
      */

      // Update socket query with the username
      socket.disconnect();
      socket.io.opts.query = { username: response.data.username };
      socket.connect();
      // Note for Caden is he wants to use:
      // - Moved the Emit user_status = 'online' after socket connects, commented out old location on line 129
      socket.once("connect", () => {
        socket.emit("user_status", {username: response.data.username, status: "online" });
      setEnteredChat(true); // Enter the chat, moved this inside the then statement but
      });
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
      // Create new user with username and password
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
      // Check if the current document.cookie is already in the userDB
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/authentication/cookies`, { cookie: document.cookie })
      .then((response) => {
        // Set the cookie if it is already in the userDB
        document.cookie = `sessionID=${uuidv4()}; browser=${window.navigator.userAgent}; expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
      })
      .catch((error) => {
        // Otherwise, do nothing
      })


      // Login with username and password
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`, { username, password, cookie: document.cookie })
      .then((response) => {
        //socket.emit("user_status", { username, status: "online" });
        /*
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username, status: "online" })
        .then((response) => console.log("User status updated:", response.data)) // Debugging log
        .catch((error) => console.error("Error updating user status:", error));
        */

        // Update socket query with the username
        socket.disconnect();
        socket.io.opts.query = { username };
        socket.connect();
        // Update user status to online
        socket.once("connect", () => {
          socket.emit("user_status", { username, status: "online" });
        });

        // User logged in successfully
        setEnteredChat(true);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          alert("Invalid password. Please try again.");
        } else {
          console.error("Error logging in:", error);
        }
      })
    }
  };

  
  /////////////////////////////////
  // DEBUGGING/CLEANUP FUNCTIONS //
  /////////////////////////////////

  // Clear the user database, will be accessible from the inspect element console for now
  const clearUserDB = () => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users`)
    .then((response) => console.log("Database cleared:", response.data)) // Debugging log
    .catch((error) => console.error("Error clearing database:", error));
  }
  window.clearUserDB = clearUserDB; // Expose the function to the window object


  // Clear the messages database, will be accessible from the inspect element console for now
  const clearMessagesFromChannel = (channel) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/channels/clear`, { data: { channel } })
    .then((response) => {
      console.log("Database cleared:", response.data) // Debugging log
    })
    .catch((error) => {
      console.error("Error clearing database:", error)
  });
  }
  window.clearMessagesFromChannel = clearMessagesFromChannel; // Expose the function to the window object


  // Set users status to offline, will be accessible from the inspect element console for now
  const setUserOffline = (username) => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username, status: "offline" })
    .then((response) => console.log("User status updated:", response.data)) // Debugging log
    .catch((error) => console.error("Error updating user status:", error));
  }
  window.setUserOffline = setUserOffline; // Expose the function to the window object`
  

  /////////////////////
  // HOOKS & EFFECTS //
  /////////////////////

  // Set the active channel to "Home" on entering chat; fetch messages and users
  useEffect(() => {
    if (enteredChat) {
        console.log(`Switching to Channel: ${activeChannel}`); // Debugging log
        fetchMessages(activeChannel);

        // Leave any previous channel before joining the new one
        socket.emit("leave_channel");
        
        // Join the new channel
        socket.emit("join_channel", { channel: activeChannel });

      // Fetch users for the sidebar
      fetchSidebar();
    }
  }, [enteredChat, activeChannel, fetchSidebar]);


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


  /* Websocket User Status Handling:
     *   - Listens for user status updates from the backend and updates the sidebar in real-time, no need to manually refresh
     *   - Ensures users persist correctly and don't duplicate
     */
  useEffect(() => {
    const handleUserStatusUpdate = (payload) => {
      const { username: updatedUsername, status } = payload;
      console.log(`User ${updatedUsername} is now ${status}`);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.username === updatedUsername ? { ...u, status } : u
        )
      );
    };

    socket.on("user_status", handleUserStatusUpdate);

    return () => {
      socket.off("user_status", handleUserStatusUpdate);
    };
  }, []);
  

  // Handle closing of the window and final update of user status to offline
  useEffect(() => {
    const handleWindowClose = (ev) => {
      /*
      if (enteredChat) {
        // Update user status to offline
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user-status`, { username, status: "offline" })
          .then((response) => console.log("User status updated:", response.data)) // Debugging log
          .catch((error) => console.error("Error updating user status:", error));
      }
      */

      // Update user status to offline
      // Disconnect the WebSocket, prevent errors
      if (enteredChat && socket.connected) {
        socket.emit("user_status", { username, status: "offline" });
      }
      socket.disconnect();
    }

    window.addEventListener("beforeunload", handleWindowClose);

    // Prevent this effect from running more than once
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    }
  }, [enteredChat, username]);

  useEffect(() => {
    const handleReconnect = () => {
      if (username && enteredChat) {
        socket.emit("user_status", { username, status: "online" });
      }
    };
  
    socket.on("connect", handleReconnect);
    return () => socket.off("connect", handleReconnect);
  }, [username, enteredChat]);

  /* The actual React app UI below: (or the important part)
   * Conditionally renders either the Login Screen (before entering chat) 
   *    OR the Chat Interface (once user has logged in).
   *      `enteredChat` state determines what gets displayed.
   * The chat interface updates dynamically based on user interactions.
   * More UI updates can be added based on user selection, channel switching, etc as
   */

  return (
    <div className={`App ${isDeveloperMode ? "dev-mode" : ""}`}>
    {isDeveloperMode && (
      <>
        <div className="dev-banner">
          Developer Mode Activated ("Ctrl" + "Alt" + 'p' to deactivate)
        </div>
        {deletionSuccess && (
          <div className="popup-message success">All messages deleted.</div>
        )}
        {noMessagesToDelete && (
          <div className="popup-message error">No messages to delete.</div>
        )}
      </>
    )}
      <button className="dev-mode-button" onClick={activateDevMode}>Enter Developer Mode</button>
      {isDeveloperMode && (
        <div className="dev-tools-panel">
          <h3>Developer Mode Commands</h3>
          <button className="delete-messages-button" onClick={handleDevDeleteAllMessages}>
            Delete All Messages
          </button>
        </div>
      )}
      <div className="container">
        {!enteredChat ? (
          <div className="entry-box">
            <img src={logo} alt="FiberSync Logo" className="logo" onClick={cookieLogin} />
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
          <>
            <div className="chat-layout">
              <ChannelSidebar
                activeChannel={activeChannel}
                setActiveChannel={setActiveChannel} />
              <div className="chat-main">
                <ChatWindow 
                  username={username}
                  messages={messages}
                  onMessagesUpdate={(updatedMessages) => setMessages(updatedMessages)}
                  onDeleteMessage={handleDeleteMessage}
                  onEditMessage={handleEditMessage} />
              </div>
              <UserSidebar
                username={username}
                users={users}
                socket={socket}
                isDeveloperMode={isDeveloperMode}
                onDevDeleteUser={handleDevDeleteUser}
              />
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );  
}

  export default App;