import React, { useState, useEffect, useRef } from 'react';

function UserSidebar() {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);

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

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
        <li>👤 User1 - <span className="status-indicator online"></span> Online</li> 
        <li>👤 User2 - <span className="status-indicator online"></span> Online</li>
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
    </div>
  );
}

export default UserSidebar;
