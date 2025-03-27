import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";


const socket = io(process.env.REACT_APP_BACKEND_URL);

function ChannelSidebar({ activeChannel, setActiveChannel }) {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // Track which channel menu is open
  const [editingChannel, setEditingChannel] = useState(null);
  const [editedChannelName, setEditedChannelName] = useState("");

  /* Channel Fetching
   * Gets the channels from the backend when the component mounts then
   * ensures that the list of channels is up-to-date.
   */
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/channels`);
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    }
    fetchChannels();
  }, []);



  /* Channel Switching
   * Handles switching between channels and updates the active channel in state.
   * Also notifies the WebSocket server that the user has switched channels.
   */
  const handleChannelSwitch = (channelName) => {
    setActiveChannel(channelName);
    socket.emit("join_channel", { channel: channelName });
  };



  /* Create a Channel
   * Sends a request to the backend to create a new channel. It updates the
   * local state after succesfully creating a channel.
   * Currently limits the total number of channels to 5, we can change this.
   */
  const createChannel = async () => {
    if (channels.length >= 5) {
      alert("Channel limit reached!");
      return;
    }
    if (!newChannelName.trim()) return;

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/channels/create`, { name: newChannelName.trim() });

      // Fetch the updated list of channels after creating a new one
      const updatedChannels = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/channels`);
      setChannels(updatedChannels.data);  // Update state with the correct names

      // Clear input field and hide the input box
      setNewChannelName("");
      setShowInput(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };



  /* Delete a Channel
   * Currently prevents deletion of the default "Home" channel for consistency.
   * 
   * Removes the other channels from the backend and updates the local state.
   * If the user is in the deleted channel, switches them to "Home".
   */
  const deleteChannel = async (channelName) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/channels/delete`, {
        data: { name: channelName }
      });
      setChannels(channels.filter(channel => channel.name !== channelName));
  
      // If deleting active channel, switch to Home
      if (activeChannel === channelName) {
        setActiveChannel(channels.length > 1 ? channels[0].name : "Home");
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };
  
  

  // Open the menu for a specific channel
  const toggleMenu = (channelName) => {
    setMenuOpen(menuOpen === channelName ? null : channelName);
  };
  
  // Start editing a channel
  const startEditing = (channelName) => {
    setEditingChannel(channelName);
    setEditedChannelName(channelName);
    setMenuOpen(null);
  };
  
  // Save the edited channel name
  const saveChannelEdit = async () => {
    if (!editedChannelName.trim()) return;
  
    try {
      // Perform API update here (Future implementation)
      console.log(`Channel renamed from ${editingChannel} to ${editedChannelName}`);
        
      // Update local state for now
      setChannels(channels.map(channel =>
        channel.name === editingChannel ? { ...channel, name: editedChannelName } : channel
      ));
        
      setEditingChannel(null);
    } catch (error) {
      console.error("Error renaming channel:", error);
    }
  };



  return (
    <div className="channel-sidebar">
      <h2>Channels</h2>

      {/* Create Channel Button */}
      <button onClick={() => setShowInput(!showInput)} className="create-channel-button">
        {showInput ? "Cancel" : "Create Channel"}
      </button>

      {/* Input for creating a new channel */}
      {showInput && (
        <div className="create-channel">
          <input
            type="text"
            className="channel-input"
            placeholder="Enter Channel Name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
          />
          <button onClick={createChannel} className="send-button">Create</button>
        </div>
      )}

      {/* List of Channels */}
      <ul className="channel-list">
        {channels.map((channel) => (
          <li key={channel.name} className={activeChannel === channel.name ? "selected" : ""}>
            {editingChannel === channel.name ? (
              <input
                type="text"
                className="edit-channel-input"
                value={editedChannelName}
                onChange={(e) => setEditedChannelName(e.target.value)}
                onBlur={saveChannelEdit}
                onKeyDown={(e) => e.key === "Enter" && saveChannelEdit()}
                autoFocus
              />
            ) : (
              <span onClick={() => handleChannelSwitch(channel.name)}>{channel.name}</span>
            )}

            {/* Context Menu (Three Dots ⋮) */}
            {channel.name !== "Home" && (
              <div className="channel-options">
                <button className="menu-button" onClick={() => toggleMenu(channel.name)}>⋮</button>

                {/* Dropdown Menu */}
                {menuOpen === channel.name && (
                  <div className="menu-dropdown">
                    <button onClick={() => startEditing(channel.name)}>Edit Channel</button>
                    <button onClick={() => deleteChannel(channel.name)}>Delete Channel</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelSidebar;
