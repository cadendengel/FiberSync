import React from 'react';

function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      <h2>Chat Messages</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ChatWindow;
