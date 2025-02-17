import React, { useState } from 'react';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() === "") return;

    // Below is the chat event object, with more details for each
    const chatEvent = {
      type: "message", // Event type, useful for future expansion such as user joins or system messages
      user: "You", // Placeholder for now, can later be dynamic with Username branch
      text: message, // The actual message content
      timestamp: new Date().toISOString() // Standardized timestamp format
    };

    onSendMessage(message);
    setMessage(""); // Clear input after sending
  };

  // Allows the user to press enter to submit their message
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatbox">
      <input 
        type="text" 
        placeholder="Type a message..." 
        value={message} 
        onChange={handleChange} 
        onKeyDown={handleKeyPress}
        className="chat-input" 
      />
      <button onClick={handleSend} className="send-button">Send</button>
    </div>
  );
}

export default ChatInput;
