import React, { useEffect, useRef, useState } from "react";

const reactionsList = ["👍", "👎", "🔥", "😂", "❤️"];

function ChatWindow({ messages }) {
  const chatMessagesRef = useRef(null);
  const pickerRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [openPicker, setOpenPicker] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      });
    }
  }, [messages]);

  // Close emoji picker if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpenPicker(null); // Close picker
      }
    }

    if (openPicker !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPicker]);

  const toggleReaction = (messageId, emoji) => {
    setMessageReactions((prev) => {
      const currentReactions = prev[messageId] || {};
      const updatedReactions = { ...currentReactions };

      if (updatedReactions[emoji]) {
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = 1;
      }

      return {
        ...prev,
        [messageId]: Object.keys(updatedReactions).length ? updatedReactions : undefined,
      };
    });
    setOpenPicker(null); // Close picker after selecting an emoji
  };

  const togglePicker = (messageId) => {
    setOpenPicker(openPicker === messageId ? null : messageId);
  };
  
  const startEditing = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };
  
  const saveEditedMessage = (messageId) => {
    if (editingText.trim()) {
      //onEditMessage(messageId, editingText); // Uncomment this line when route is implemented
    }
    setEditingMessageId(null);
  };
  
  const deleteMessage = (messageId) => {
    //onDeleteMessage(messageId); // Uncomment this line when route is implemented
  };

  return (
    <div className="chat-window" style={{ flex: 1, overflowY: "auto", maxHeight: "60vh", padding: "10px" }}>
      <h2>Chat Messages</h2>
      <div className="chat-messages" ref={chatMessagesRef} style={{ maxHeight: "50vh", overflowY: "auto" }}>
        {messages.map((msg) => (
          <div
            key={msg.messageid}
            className="message-container"
            style={{
              position: "relative",
              padding: "12px",
              borderBottom: "1px solid #ddd",
              borderRadius: "12px", // Rounded corners for message bubbles
              backgroundColor: "#333", // Dark background for the message box
              color: "white", // White text inside
              marginBottom: "8px", // Space between messages
            }}
          >
<<<<<<< HEAD
            {editingMessageId === msg.messageid ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => saveEditedMessage(msg.messageid)}
                onKeyDown={(e) => e.key === "Enter" && saveEditedMessage(msg.messageid)}
                autoFocus
                style={{ width: "100%", padding: "5px", fontSize: "1em" }}
              />
            ) : (
              <p>
                <strong>{msg.user}:</strong> {msg.text}
              </p>
            )}
  
=======
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <img
                src={`https://ui-avatars.com/api/?name=${msg.user}&background=random&color=fff&size=128`} // Dynamic user-based default avatar
                alt={`${msg.user}'s avatar`}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "8px", // Space between avatar and message
                }}
              />
              <strong>{msg.user}:</strong>
            </div>
            <p>{msg.text}</p>

>>>>>>> d5d0cce (SCRUM-78 Added dynamic profile pictures generated from the user's name and a unique color)
            <div className="reactions" style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
              {messageReactions[msg.messageid] &&
                Object.entries(messageReactions[msg.messageid]).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    onClick={() => toggleReaction(msg.messageid, emoji)}
                    style={{
                      padding: "4px",
                      background: "#555", 
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {emoji} {count}
                  </span>
                ))}
            </div>
<<<<<<< HEAD
  
            {/* Reaction Picker, Edit, and Delete Buttons */}
            <div className="message-options" style={{ position: "absolute", right: "10px", top: "10px", display: "flex", gap: "5px" }}>
              {/* Add Reaction Button */}
              <span onClick={() => togglePicker(msg.messageid)} style={{ cursor: "pointer", fontWeight: "bold" }}>
=======

            <div className="reaction-picker" style={{ position: "absolute", right: "10px", top: "10px", cursor: "pointer" }}>
              <span 
                onClick={() => togglePicker(msg.messageid)}
                style={{ color: "#fff", fontWeight: "bold" }} 
              >
>>>>>>> 35c2db2 (SCRUM-78 added styling changes to messages.)
                ➕
              </span>
              {openPicker === msg.messageid && (
                <div
                  ref={pickerRef}
                  className="reaction-options"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "100%",
                    background: "#444",
                    padding: "5px",
                    borderRadius: "8px", 
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    display: "flex",
                    gap: "5px",
                    zIndex: 999,
                  }}
                >
                  {reactionsList.map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => toggleReaction(msg.messageid, emoji)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        cursor: "pointer",
                        lineHeight: "1",
                        fontSize: "1.2em",
                        borderRadius: "8px", 
                        color: "white", 
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
  
              {/* Edit Button */}
              <span
                onClick={() => startEditing(msg.messageid, msg.text)}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                ✏️
              </span>
  
              {/* Delete Button */}
              <span
                onClick={() => deleteMessage(msg.messageid)}
                style={{ cursor: "pointer", color: "red", marginLeft: "5px" }}
              >
                🗑️
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatWindow;
