import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages }) {
  const chatMessagesRef = useRef(null);

  // Auto-scroll to the latest message when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      });
    }
  }, [messages]);

  return (
    <div className="chat-window" style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', padding: '10px' }}>
      <h2>Chat Messages</h2>
      <div className="chat-messages" ref={chatMessagesRef} style={{ maxHeight: '50vh', overflowY: 'auto' }}>
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
