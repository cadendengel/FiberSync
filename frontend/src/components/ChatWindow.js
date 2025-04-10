import './ChatWindow.css';
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const reactionsList = ["👍", "👎", "🔥", "😂", "❤️"];

function ChatWindow({ username, messages, onMessagesUpdate }) {
  const chatMessagesRef = useRef(null);
  const pickerRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [openPicker, setOpenPicker] = useState(null);

  const [editedMessageId, setEditingMessageId] = useState("");
  const [editedMessageText, setEditedMessage] = useState("");

  useEffect(() => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      });
    }
  }, [messages]);

  useEffect(() => {
    const initialReactions = {};
    messages.forEach((msg) => {
      initialReactions[msg.messageid] = msg.reactions || {};
    });
    setMessageReactions(initialReactions);
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpenPicker(null);
      }
    }

    if (openPicker !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPicker]);

  const incrementReaction = async (messageId, emoji) => {
    setMessageReactions((prev) => {
      const updatedReactions = { ...prev[messageId], [emoji]: (prev[messageId]?.[emoji] || 0) + 1 };
      return { ...prev, [messageId]: updatedReactions };
    });

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/messages/reactions`, {
        message_id: messageId,
        emoji,
        mode: "inc",
      });
    } catch (error) {
      console.error("Error incrementing reaction:", error);
    }
  };

  const decrementReaction = async (messageId, emoji) => {
    setMessageReactions((prev) => {
      const updatedReactions = { ...prev[messageId] };
      if (updatedReactions[emoji] > 1) {
        updatedReactions[emoji] -= 1;
      } else {
        delete updatedReactions[emoji];
      }
      return { ...prev, [messageId]: Object.keys(updatedReactions).length ? updatedReactions : undefined };
    });

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/messages/reactions`, {
        message_id: messageId,
        emoji,
        mode: "dec",
      });
    } catch (error) {
      console.error("Error decrementing reaction:", error);
    }
  };

  const togglePicker = (messageId) => {
    setOpenPicker(openPicker === messageId ? null : messageId);
  };

  const startEditingMessage = (username, messageId, text) => {
    const message = messages.find((msg) => msg.messageid === messageId);
    if (message.user !== username) {
      console.error("You can only edit your own messages.");
      return;
    }
    setEditingMessageId(messageId);
    setEditedMessage(text);
  };

  const editMessage = async (messageId, text) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/messages/edit`, {
        message_id: messageId,
        text,
      });

      const updatedMessages = messages.map((msg) =>
        msg.messageid === messageId ? { ...msg, text } : msg
      );
      onMessagesUpdate(updatedMessages);

      setEditingMessageId("");
      setEditedMessage("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const deleteMessage = async (username, messageId) => {
    const message = messages.find((msg) => msg.messageid === messageId);
    if (message.user !== username) {
      console.error("You can only delete your own messages.");
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/messages/id`, {
        data: { messageid: messageId },
      });

      const updatedMessages = messages.filter((msg) => msg.messageid !== messageId);
      onMessagesUpdate(updatedMessages);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="chat-window">
      <h2>Chat Messages</h2>
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg) => (
          <div className="message-container" key={msg.messageid}>
            <div className="message-header">
              <img
                src={`https://ui-avatars.com/api/?name=${msg.user}&background=random&color=fff&size=128`}
                alt={`${msg.user}'s avatar`}
                className="message-avatar"
              />
              <strong>{msg.user}:</strong>
            </div>

            {editedMessageId === msg.messageid ? (
              <input
                type="text"
                value={editedMessageText}
                onChange={(e) => setEditedMessage(e.target.value)}
                onBlur={() => setEditingMessageId("")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editMessage(msg.messageid, editedMessageText);
                    setEditingMessageId("");
                  }
                }}
                autoFocus
                className="edit-input"
              />
            ) : (
              <p>{msg.text}</p>
            )}

            <div className="reactions">
              {messageReactions[msg.messageid] &&
                Object.entries(messageReactions[msg.messageid]).map(([emoji, count]) => (
                  <span key={emoji} onClick={() => decrementReaction(msg.messageid, emoji)} className="reaction">
                    {emoji} {count}
                  </span>
                ))}
            </div>

            <div className="reaction-picker">
              <span onClick={() => togglePicker(msg.messageid)} className="picker-button">➕</span>

              {openPicker === msg.messageid && (
                <div className="reaction-options" ref={pickerRef}>
                  {reactionsList.map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => incrementReaction(msg.messageid, emoji)}
                      className="reaction-option"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              <span onClick={() => startEditingMessage(username, msg.messageid, msg.text)} className="edit-icon">✏️</span>
              <span onClick={() => deleteMessage(username, msg.messageid)} className="delete-icon">🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatWindow;
