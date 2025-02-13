import React, { useState } from 'react';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() === "") return;
    onSendMessage(message);
    setMessage(""); // Clear input after sending
  };

  return (
    <div className="chatbox">
      <input 
        type="text" 
        placeholder="Type a message..." 
        value={message} 
        onChange={handleChange} 
        className="chat-input" 
      />
      <button onClick={handleSend} className="send-button">Send</button>
    </div>
  );
}

export default ChatInput;
