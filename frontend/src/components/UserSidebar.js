import React, { useState } from 'react';

function UserSidebar() {
  const [status, setStatus] = useState("online"); // Default to online

  const toggleStatus = () => {
    setStatus(prevStatus => (prevStatus === "online" ? "offline" : "online"));
  };

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
        <li>👤 User1 - <span className="status online">Online</span></li>
        <li>👤 User2 - <span className="status online">Online</span></li>
        <li>
          👤 User (You) - 
          <span 
            className={`status ${status}`} 
            onClick={toggleStatus} 
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {status === "online" ? "Online" : "Offline"}
          </span>
        </li>
      </ul>
    </div>
  );
}

export default UserSidebar;
