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
      onEditMessage(messageId, editingText);
    }
    setEditingMessageId(null);
  };
  
  const deleteMessage = (messageId) => {
    onDeleteMessage(messageId);
  };

  return (
    <div className="chat-window" style={{ flex: 1, overflowY: "auto", maxHeight: "60vh", padding: "10px" }}>
      <h2>Chat Messages</h2>
      <div className="chat-messages" ref={chatMessagesRef} style={{ maxHeight: "50vh", overflowY: "auto" }}>
        {messages.map((msg) => (
          <div
            key={msg.messageid}
            className="message-container"
            style={{ position: "relative", padding: "8px", borderBottom: "1px solid #ddd" }}
          >
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
  
            <div className="reactions" style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
              {messageReactions[msg.messageid] &&
                Object.entries(messageReactions[msg.messageid]).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    onClick={() => toggleReaction(msg.messageid, emoji)}
                    style={{
                      padding: "4px",
                      background: "#eee",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {emoji} {count}
                  </span>
                ))}
            </div>
  
            {/* Reaction Picker, Edit, and Delete Buttons */}
            <div className="message-options" style={{ position: "absolute", right: "10px", top: "10px", display: "flex", gap: "5px" }}>
              {/* Add Reaction Button */}
              <span onClick={() => togglePicker(msg.messageid)} style={{ cursor: "pointer", fontWeight: "bold" }}>
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
                    background: "#fff",
                    padding: "5px",
                    borderRadius: "5px",
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
