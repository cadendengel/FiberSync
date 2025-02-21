import React, { useState } from 'react';
import ChatMessage from './ChatMessage';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");

  // update input with text as user types
  const handleChange = (e) => {
    setMessage(e.target.value); 
  };

  // Creates chat message to be sent to parent component
  const handleSend = () => {
    if (message.trim() === "") return;
    onSendMessage(new ChatMessage("You", message)); //Fix "You" to username
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
