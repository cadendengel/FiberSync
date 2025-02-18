import React, { useState } from 'react';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() === "") return;
  
    const chatEvent = {
      type: "message",
      user: "You",  // Placeholder for now, will be dynamic later
      text: message,
      timestamp: new Date().toISOString(),
    };
  
    onSendMessage(chatEvent); // Pass the full chat event instead of just message
    setMessage("");  // Clear input after sending
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
