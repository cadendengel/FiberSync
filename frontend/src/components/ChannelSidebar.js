import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ChannelSidebar({ activeChannel, setActiveChannel }) {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Load channels from the backend when component mounts
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

  // Switch active channel and notify WebSockets
  const handleChannelSwitch = (channelName) => {
    setActiveChannel(channelName);
    socket.emit("join_channel", { channel: channelName });
  };

  // Create a new channel (Limit: 5)
  const createChannel = async () => {
    if (channels.length >= 5) {
      alert("Channel limit reached!");
      return;
    }
    if (!newChannelName.trim()) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/channels/create`, { name: newChannelName.trim() });

      // FIX: Instead of using response.data, fetch channels from backend after creation
      const updatedChannels = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/channels`);
      setChannels(updatedChannels.data);  // Update state with the correct names

      setNewChannelName("");
      setShowInput(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  // Delete a channel
  const deleteChannel = async (channelName) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/channels/delete`, {
        data: { name: channelName }
      });
      setChannels(channels.filter(channel => channel.name !== channelName));

      // If deleting active channel, switch to another available channel
      if (activeChannel === channelName) {
        setActiveChannel(channels.length > 1 ? channels[0].name : "Home");
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
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
            <span onClick={() => handleChannelSwitch(channel.name)}>{channel.name}</span>

            {/* Delete Button (Only if it's NOT the default channel) */}
            {channel.name !== "Home" && (
              <button onClick={() => deleteChannel(channel.name)} className="delete-channel-button">❌</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelSidebar;
