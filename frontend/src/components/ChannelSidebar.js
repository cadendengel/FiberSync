import React, { useState, useEffect } from "react";

function ChannelSidebar({ activeChannel, setActiveChannel }) {
  const [channels, setChannels] = useState([
    { id: 1, name: "Primary Channel" }
  ]);
  const [newChannelName, setNewChannelName] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!channels.find(channel => channel.name === activeChannel)) {
      setActiveChannel(channels.length > 0 ? channels[0].name : "Primary Channel");
    }
  }, [channels]);

  function createChannel() {
    if (channels.length >= 5) {
      alert("Channel limit reached!");
      return;
    }
    if (!newChannelName.trim()) return;
    
    const newChannel = { id: channels.length + 1, name: newChannelName };
    setChannels([...channels, newChannel]);
    setNewChannelName("");
    setShowInput(false);
  }

  return (
    <div className="channel-sidebar">
      <h2>Channels</h2>
      <button onClick={() => setShowInput(!showInput)} className="create-channel-button">
        {showInput ? "Cancel" : "Create Channel"}
      </button>

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

      <ul className="channel-list">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className={`channel-item ${activeChannel === channel.name ? "selected" : ""}`}
            onClick={() => setActiveChannel(channel.name)}
          >
            {channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelSidebar;
