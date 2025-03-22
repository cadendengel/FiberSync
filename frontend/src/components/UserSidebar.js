import React, { useState, useEffect, useRef } from 'react';

function UserSidebar() {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({}); // Placeholder for Direct Messaging
  const [notifications, setNotifications] = useState({}); // DM notification

  const users = ["Fiber"]; // Placeholder user, future feature idea, Fiber has AI integration to allow
                           // real time communication with our Fiber Guy AI!


  // Function to switch to "away" if inactive
  const startInactivityTimer = () => {
    if (status !== "offline") {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setStatus("away");
      }, 300000); // 5 minutes of inactivity (300,000 ms) (10000 10s timer for testing) 
    }
  };

  // Reset status to online when user interacts
  const resetStatus = () => {
    if (status !== "offline") {
      if (status === "away") {
        setStatus("online"); // Change back only if currently "away"
      }
      startInactivityTimer();
    }
  };

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
  }, [status]); // Re-run useEffect when status changes

  const toggleStatus = () => {
    setStatus(prevStatus => {
      if (prevStatus === "offline") {
        return "online"; // If currently offline, set to online
      }
      return prevStatus === "online" ? "offline" : "online"; // Toggle between online and offline
    });
  };

  /* User Selection for future "Direct Message" feature. 
   * Currently only planning to do for this is set up the groundwork for a future feature. 
   * What I am doing is setting up a chat window when you select a User (One of our filler Users)
   * You can send a message to that user and a small chat window will show up.
   * I'll have the Filler User respond with "I recieved your message!"
   * A small bubble should show up by their name showing you recieved a message 
   */

  const openChat = (user) => {
    setSelectedUser(user);
    setNotifications((prev) => ({ ...prev, [user]: false })); // Clear notifications when opened
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

      // Simulated Auto-Response
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [user]: [...(prev[user] || []), { sender: user, text: "I received your message!" }],
        }));

        // Show notification if chat is closed
        if (selectedUser !== user) {
          setNotifications((prev) => ({ ...prev, [user]: true }));
        }
      }, 1000);
    }
  };

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user} onClick={() => openChat(user)} className={notifications[user] ? "notification" : ""}>
            👤 {user}
            {notifications[user] && <span className="message-bubble">•</span>}
          </li>
        ))}

        <li>
          👤 User (You) - 
          <span 
            className={`status-indicator ${status}`} 
            onClick={toggleStatus} 
            style={{ cursor: 'pointer', marginLeft: '8px' }}
          ></span>
          <span 
            onClick={toggleStatus} 
            style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </li>
      </ul>

      {/* Direct Message Box (Appears if a User is Selected) */}
      {selectedUser && (
        <div className="dm-box">
          <div className="dm-header">
            <span>Chat with {selectedUser}</span>
            <button onClick={closeChat}>✖</button>
          </div>
          <div className="dm-messages">
            {messages[selectedUser]?.map((msg, index) => (
              <p key={index} className={msg.sender === "You" ? "sent" : "received"}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input type="text" placeholder="Type a message..." onKeyDown={(e) => sendMessage(e, selectedUser)} />
        </div>
      )}
    </div>
  );
}

export default UserSidebar;
