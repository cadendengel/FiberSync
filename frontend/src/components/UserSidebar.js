import React, { useState, useEffect, useRef, useCallback } from 'react';
import './UserSidebar.css'; // Modular CSS if you break it out later


function UserSidebar({ username, users, socket, isDeveloperMode, onDevDeleteUser, onStartDM }) {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);
  const [activeUserMenu, setActiveUserMenu] = useState(null); // tracks which user's menu is open
  const [viewingProfile, setViewingProfile] = useState(null);


  // Inactivity logic
  const startInactivityTimer = useCallback(() => {
    if (status !== "offline") {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setStatus("away");
      }, 300000); // 5 min
    }
  }, [status]);

  const resetStatus = useCallback(() => {
    if (status !== "offline") {
      if (status === "away") setStatus("online");
      startInactivityTimer();
    }
  }, [status, startInactivityTimer]);

  useEffect(() => {
    if (socket && username && (status === "away" || status === "online")) {
      socket.emit("user_status", { username, status });
    }
  }, [status, socket, username]);

  useEffect(() => {
    // Listen for user activity
    window.addEventListener("mousemove", resetStatus);
    window.addEventListener("keydown", resetStatus);
    window.addEventListener("click", resetStatus);
    startInactivityTimer();
    return () => {
      window.removeEventListener("mousemove", resetStatus);
      window.removeEventListener("keydown", resetStatus);
      window.removeEventListener("click", resetStatus);
      clearTimeout(inactivityTimer.current);
    };
  }, [resetStatus, startInactivityTimer]);

  const toggleUserMenu = (user) => {
    setActiveUserMenu(activeUserMenu === user ? null : user);
  };

  return (
    <div className="chat-sidebar">
      <h2>Users</h2>
      <ul className="user-list">
            {viewingProfile && (
        <div className="profile-popup" onClick={() => setViewingProfile(null)}>
          <div className="profile-card" onClick={(e) => e.stopPropagation()}>
          <div className="profile-picture">
              <img
                src={`https://ui-avatars.com/api/?name=${viewingProfile.username}&background=random&color=fff&size=128`}
                alt={`${viewingProfile.username}'s avatar`}
                className="profile-avatar"
              />
            </div>
            <div className="profile-info">
              <h3>{viewingProfile.username}</h3>
              <p className={`status ${viewingProfile.status}`}>{viewingProfile.status}</p>
              <div className="profile-description-box">
              {/* Placeholder for now, will contain user description later */}
              <p className="description-placeholder">This user hasn't written a description yet.</p>
            </div>
            </div>
          </div>
        </div>
      )}
      <li className="user-entry">
        <div>
          👤 <span className={`status-indicator ${status}`}></span> {username} (you)
        </div>
      </li>

        {/* I thought adding the + user.status here would force it to render status changes.. but it's showing a blank space..*/}
        {users.map(user => (
          user?.username && user.username !== "You" && (
            <li key={user.username} className="user-entry">
              <div onClick={() => toggleUserMenu(user.username)}>
                👤 <span className={`status-indicator ${user.status}`}></span> {user.username}
              </div>

              {/* Dropdown menu when clicked */}
              {activeUserMenu === user.username && (
                <div className="user-dropdown">
                  <button onClick={() => setViewingProfile(user)}>View Profile</button>
                  <button onClick={() => onStartDM(user.username)}>Send Message</button>
                  {isDeveloperMode && (
                    <button
                      onClick={() => {
                          // add confirmation soon
                          onDevDeleteUser(user.username); 
                          // possible end of if statement here for next task
                      }}
                      style={{ color: "red" }}
                    >
                      ❌ Delete User
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default UserSidebar;