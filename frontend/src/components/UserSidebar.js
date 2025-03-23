import React, { useState, useEffect, useRef } from 'react';

function UserSidebar({ users }) {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);

  useEffect(() => {
    for (const user of users) {
      //console.log(users);
      //console.log("User:", user.username, "Status:", user.status);
    }
  }, [users]);


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

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
        <li>
          👤 You - 
          <span 
            className={`status-indicator ${"online"}`} 
            style={{ cursor: 'pointer', marginLeft: '8px' }}
          ></span>
        </li>
        {users.map(user => (
          user && user.status && user.username  ? (
            <li key={user.status + user.username}>
              {user.username} - 
              <span className={`status-indicator ${user.status}`} ></span>
            </li>
          ) : null
        ))}
      </ul>
    </div>
  );
}

export default UserSidebar;
