import React, { useState } from "react";

function ChannelSidebar() {
  // Temporary state (replaces API call for now)
  const [channels, setChannels] = useState([{ id: 1, name: "Primary Channel" }]);
  const [showMenu, setShowMenu] = useState(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [showInput, setShowInput] = useState(false); // Controls visibility of input box

  // Function to create a new channel
  function createChannel() {
    if (channels.length >= 5) {
      alert("Channel limit reached!");
      return;
    }
    if (!newChannelName.trim()) return;
    
    const newChannel = { id: channels.length + 1, name: newChannelName };
    setChannels([...channels, newChannel]);
    setNewChannelName("");
    setShowInput(false); // Hide input box after creating a channel
  }

  // Function to rename a channel
  function renameChannel(id) {
    const newName = prompt("Enter new name");
    if (!newName) return;
    
    setChannels(channels.map(channel => 
      channel.id === id ? { ...channel, name: newName } : channel
    ));
    setShowMenu(null);
  }

  // Function to delete a channel
  function deleteChannel(id) {
    setChannels(channels.filter(channel => channel.id !== id));
    setShowMenu(null);
  }

  return React.createElement(
    "div",
    { className: "channel-sidebar" },
    
    React.createElement("h2", null, "Channels"),
    
    // "Create Channel" button at the top
    React.createElement(
      "button",
      {
        onClick: () => setShowInput(!showInput),
        className: "create-channel-button"
      },
      showInput ? "Cancel" : "➕ Create Channel"
    ),

    // Input box appears only if showInput is true
    showInput &&
      React.createElement(
        "div",
        { className: "create-channel" },
        React.createElement("input", {
          type: "text",
          placeholder: "Enter Channel Name",
          value: newChannelName,
          onChange: (e) => setNewChannelName(e.target.value),
        }),
        React.createElement(
          "button",
          { onClick: createChannel },
          "Create"
        )
      ),

    // Channels now map user-friendly names (frontend) to their respective MongoDB collections (backend)
    React.createElement(
      "ul",
      null,
      channels.map((channel) =>
        React.createElement(
          "li",
          { key: channel.id, className: "channel-item" },
          React.createElement("span", null, channel.name),
          React.createElement(
            "button",
            {
              onClick: () => setShowMenu(showMenu === channel.id ? null : channel.id),
            },
            "⋮"
          ),
          showMenu === channel.id
            ? React.createElement(
                "div",
                { className: "channel-menu" },
                React.createElement(
                  "button",
                  { onClick: () => renameChannel(channel.id) },
                  "Rename"
                ),
                React.createElement(
                  "button",
                  { onClick: () => deleteChannel(channel.id) },
                  "Delete"
                )
              )
            : null
        )
      )
    )
  );
}

export default ChannelSidebar;
