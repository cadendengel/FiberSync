import React, { useState, useEffect, useRef, useCallback } from 'react';
import './UserSidebar.css'; // Modular CSS if you break it out later
import axios from 'axios';


function UserSidebar({ username, users, socket, isDeveloperMode, onDevDeleteUser, onStartDM }) {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);
  const [activeUserMenu, setActiveUserMenu] = useState(null); // tracks which user's menu is open
  const [viewingProfile, setViewingProfile] = useState(null);
  const [profileData, setProfileData] = useState(null); // State to store profile data
  const [isEditingProfile, setIsEditingProfile] = useState(false); // State to track if editing profile
  const [editProfileData, setEditProfileData] = useState({ description: "" }); // State to store edited profile data
  
  
  const updateProfileData = async (user) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/timestamp`, {username: user.username});
      const timestamp = new Date(response.data.timestamp * 1000).toUTCString();
      setProfileData((prev) => ({ ...prev, timestamp: timestamp }));
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/description`, { username: user.username });
      const description = response.data.description || "I have no description right now!";
      setProfileData((prev) => ({ ...prev, description: description }));
    } catch (error) {
      console.error("Error fetching profile description:", error);
    }
  };

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

  const inviteToDM = (usernameTarget) => {
    socket.emit("dm_invite", {
      from: username,
      to: usernameTarget // string only
    });
    setActiveUserMenu(null);
  };
    
  const handleEditProfile = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/description`, {
        username: username,
        description: editProfileData.description,
      });
      setProfileData((prev) => ({ ...prev, description: editProfileData.description }));
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
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
                {profileData ? (
                  <>
                    <p>User Since: {profileData.timestamp}</p>
                    <br></br>
                    <p>{profileData.description}</p> 
                  </>
                ) : (
                  <p>Loading profile data...</p>
                )}
            </div>
            {/* Edit Profile Section */}
            {viewingProfile.username === username && (
              <div className="edit-profile-section">
                {isEditingProfile ? (
                  <div className="edit-profile-form">
                    <textarea
                      value={editProfileData.description}
                      onChange={(e) => setEditProfileData({ description: e.target.value })}
                      placeholder="Update your description..."
                    />
                    <button onClick={handleEditProfile}>Save</button>
                    <button onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => {
                    setIsEditingProfile(true);
                    setEditProfileData({ description: profileData?.description || "" });
                  }}>
                    Edit Profile
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
      <li className="user-entry">
        <div onClick={() => {updateProfileData({ username, status }); setViewingProfile({ username, status })}}>
          {/* User's own profile */}
          👤 <span className={`status-indicator ${status}`}></span> {username} (you)
        </div>
      </li>

        {/* I thought adding the + user.status here would force it to render status changes.. but it's showing a blank space..*/}
        {users.map(user => (
          user?.username && user.username !== "You" && (
            <li key={user.username} className="user-entry">
              <div onClick={() => toggleUserMenu(user.username)}>
                👤 <span className={`status-indicator ${user.status}`}></span> 
                {user.username}
              </div>

              {/* Dropdown menu when clicked */}
              {activeUserMenu === user.username && (
                <div className="user-dropdown">
                  <button onClick={() => {updateProfileData(user); setViewingProfile(user);}}>View Profile</button>
                  <button onClick={() => inviteToDM(user.username)}>Invite to Message</button>
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