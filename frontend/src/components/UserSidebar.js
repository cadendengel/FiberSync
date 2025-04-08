import React, { useState, useEffect, useRef, useCallback } from 'react';


function UserSidebar({ username, users }) {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDM, setActiveDM] = useState(null); // newly added for DMs
  const [messages, setMessages] = useState({}); // Placeholder for Direct Messaging
  const [notifications, setNotifications] = useState({}); // DM notification not currently functioning 3/22/25
  const [currentUser] = useState(username); // Placeholder for current user
  

  // Function to switch to "away" if inactive
  const startInactivityTimer = useCallback(() => {
    if (status !== "offline") {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setStatus("away");
      }, 300000); // 5 minutes of inactivity (300,000 ms) (10000 10s timer for testing) 
    }
  }, [status]);

  // Reset status to online when user interacts
  const resetStatus = useCallback(() => {
    if (status !== "offline") {
      if (status === "away") {
        setStatus("online"); // Change back only if currently "away"
      }
      startInactivityTimer();
    }
  }, [status, startInactivityTimer]);

  useEffect(() => {
    // Listen for user activity
    window.addEventListener("mousemove", resetStatus);
    window.addEventListener("keydown", resetStatus);
    window.addEventListener("click", resetStatus);

    // Start inactivity timer
    startInactivityTimer();

    return () => {
      // Cleanup event listeners
      window.removeEventListener("mousemove", resetStatus);
      window.removeEventListener("keydown", resetStatus);
      window.removeEventListener("click", resetStatus);
      clearTimeout(inactivityTimer.current);
    };
  }, [resetStatus, startInactivityTimer, inactivityTimer]); // Re-run useEffect when status changes

  /* User Selection for future "Direct Message" feature. 
   * Currently only planning to do for this is set up the groundwork for a future feature. 
   * What I am doing is setting up a chat window when you select a User (One of our filler Users)
   * You can send a message to that user and a small chat window will show up.
   * I'll have the Filler User respond with "I recieved your message!"
   * A small bubble should show up by their name showing you recieved a message 
   */

  const openChat = (user) => {
    setSelectedUser(user);
  
    // We can emit a WebSocket "join_dm_room" event here
    // socket.emit("join_dm", { user1: currentUser, user2: user });
  
    setNotifications((prev) => ({ ...prev, [user]: false }));
  };

  const closeChat = () => {
    setSelectedUser(null);
  };

  const sendMessage = (event, user) => {
    if (event.key === "Enter") {
      const newMessage = event.target.value;
      if (!newMessage.trim()) return;

      setMessages((prev) => ({
        ...prev,
        [user]: [...(prev[user] || []), { sender: "You", text: newMessage }],
      }));

      event.target.value = ""; // Clear input

      // Simulated Auto-Response for now.
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [user]: [...(prev[user] || []), { sender: user, text: "I received your message!" }],
        }));

        // Show notification if chat is closed
        if (selectedUser !== user) {
          setNotifications((prev) => ({ ...prev, [user]: true }));
        }
      }, 3000);
    }
  };

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
        <li>
          👤 <span className="status-indicator online"></span> {currentUser} (you)
        </li>

        {users.map(user => (
          user.username && user.username !== currentUser && (
            <li 
              key={user.username} 
              onClick={() => setSelectedUser(user.username)} 
              className={`user-item ${selectedUser === user.username ? "selected" : ""}`}
            >
              👤 <span className={`status-indicator ${user.status}`}></span> {user.username}
              {notifications[user.username] && <span className="message-bubble">•</span>}
            </li>
          )
        ))}
      </ul>
      {selectedUser && !activeDM && (
        <div className="dm-action-bar">
          <p>Start a conversation with <strong>{selectedUser}</strong>?</p>
          <button onClick={() => {
            setActiveDM(selectedUser);
            setNotifications((prev) => ({ ...prev, [selectedUser]: false }));
          }}>Send Message</button>
        </div>
      )}

      {activeDM && (
        <div className="dm-box">
          <div className="dm-header">
            <span>Chat with {activeDM}</span>
            <button onClick={() => {
              setActiveDM(null);
              setSelectedUser(null);
            }}>✖</button>
          </div>
          <div className="dm-messages">
            {messages[activeDM]?.map((msg, index) => (
              <p key={index} className={msg.sender === "You" ? "sent" : "received"}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            onKeyDown={(e) => sendMessage(e, activeDM)}
          />
        </div>
      )}
    </div>
  );
}

export default UserSidebar;
