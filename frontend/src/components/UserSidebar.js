import React, { useState, useEffect, useRef, useCallback } from 'react';
import './UserSidebar.css'; // Modular CSS if you break it out later
import axios from 'axios';


function UserSidebar({ username, users, socket, isDeveloperMode, onDevDeleteUser, get }) {
  const [status, setStatus] = useState("online"); // Default to online
  const inactivityTimer = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState({});
  const [activeUserMenu, setActiveUserMenu] = useState(null); // tracks which user's menu is open
  const [dmBoxPosition, setDmBoxPosition] = useState({ x: 100, y: 100 });
  const [snapEnabled, setSnapEnabled] = useState(false); // New state to get the box back in corner
  const dmBoxRef = useRef();
  const [minimized, setMinimized] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [profileData, setProfileData] = useState(null); // State to store profile data
  const [isEditingProfile, setIsEditingProfile] = useState(false); // State to track if editing profile
  const [editProfileData, setEditProfileData] = useState({ description: "" }); // State to store edited profile data
  
  
  const updateProfileData = async (user) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/timestamp`, {username: user.username});
      setProfileData((prev) => ({ ...prev, timestamp: response.data.timestamp }));
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/description`, { username: user.username });
      setProfileData((prev) => ({ ...prev, description: response.data.description }));
    }
    catch (error) {
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

  const openDM = (user) => {
    setSelectedUser(user);
    setNotifications((prev) => ({ ...prev, [user]: false }));
    setActiveUserMenu(null);
  };

  const closeDM = () => setSelectedUser(null);

  const startDragging = (e) => {
    const box = dmBoxRef.current;
    const offsetX = e.clientX - box.getBoundingClientRect().left;
    const offsetY = e.clientY - box.getBoundingClientRect().top;
  
    const handleMouseMove = (eMove) => {
      setDmBoxPosition({
        x: eMove.clientX - offsetX,
        y: eMove.clientY - offsetY
      });
    };
  
    const stopDragging = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
  };

  const snapToCorner = () => {
    const margin = 20;
    const chatWidth = 400; // match default dm-box width
    const chatHeight = 350; // match default dm-box height
  
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    const x = screenWidth - chatWidth - margin;
    const y = screenHeight - chatHeight - margin;
  
    setSnapEnabled(true);
    setDmBoxPosition({ x, y });
  
    // Optionally disable snap after it animates
    setTimeout(() => setSnapEnabled(false), 300);
  };

  const sendMessage = (event, user) => {
    if (event.key === "Enter") {
      const newMessage = event.target.value.trim();
      if (!newMessage) return;

      setMessages((prev) => ({
        ...prev,
        [user]: [...(prev[user] || []), { sender: "You", text: newMessage }],
      }));

      event.target.value = "";

      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [user]: [...(prev[user] || []), { sender: user, text: "I received your message!" }],
        }));

        if (selectedUser !== user) {
          setNotifications((prev) => ({ ...prev, [user]: true }));
        }
      }, 3000);
    }
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
                    <p>{profileData.description}</p> 
                  </>
                ) : (
                  <p>User has not edited their description</p>
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
        <div onClick={() => setViewingProfile({ username, status })}>
          {/* User's own profile */}
          👤 <span className={`status-indicator ${status}`}></span> {username} (you)
        </div>
      </li>

        {/* I thought adding the + user.status here would force it to render status changes.. but it's showing a blank space..*/}
        {users.map(user => (
          user?.username && user.username !== "You" && (
            <li key={user.username} className="user-entry">
              <div onClick={() => toggleUserMenu(user.username)}>
                👤 <span className={`status-indicator ${user.status}`}></span> {user.username}
                {notifications[user.username] && <span className="message-bubble">•</span>}
              </div>

              {/* Dropdown menu when clicked */}
              {activeUserMenu === user.username && (
                <div className="user-dropdown">
                  <button onClick={() => {updateProfileData(user); setViewingProfile(user);}}>View Profile</button>
                  <button onClick={() => openDM(user.username)}>Send Message</button>
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
      {/* Mini Tab if minimized */}
      {minimized && selectedUser && (
        <div className="dm-mini-tab" onClick={() => setMinimized(false)}>
          💬 Chat with {selectedUser}
        </div>
      )}

      {/* Direct Message Box */}
      {!minimized && selectedUser && (
        <div
          ref={dmBoxRef}
          className={`dm-box ${snapEnabled ? 'snapping' : ''}`}
          style={{
            left: dmBoxPosition.x,
            top: dmBoxPosition.y,
            transition: snapEnabled ? 'all 0.3s ease-in-out' : 'none',
          }}
        >
            <div className="dm-header" onMouseDown={startDragging}>
            <span>Chat with {selectedUser}</span>
            <div>
              <button onClick={() => {
                setMinimized(true);
                snapToCorner();
              }}>-</button>
              <button onClick={snapToCorner}>!</button>
              <button onClick={closeDM}>x</button>
            </div>
          </div>
          <div className="dm-messages">
            {messages[selectedUser]?.map((msg, i) => (
              <p key={i} className={msg.sender === "You" ? "sent" : "received"}>
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