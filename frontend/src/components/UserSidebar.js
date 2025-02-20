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
