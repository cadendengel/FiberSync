import React, { useState, useEffect, useRef } from "react";
import './DirectMessaging.css';

function DirectMessaging({ dmTarget, dmMessages, onSend, onClose }) {
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: null, y: null });
  const dmRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    const container = dmRef.current?.querySelector(".dm-messages");
    if (container) container.scrollTop = container.scrollHeight;
  }, [dmMessages]);

  // Handle dragging
  const handleMouseDown = (e) => {
    const dmBox = dmRef.current;
    const offsetX = e.clientX - dmBox.getBoundingClientRect().left;
    const offsetY = e.clientY - dmBox.getBoundingClientRect().top;

    const handleMouseMove = (eMove) => {
      setPosition({
        x: eMove.clientX - offsetX,
        y: eMove.clientY - offsetY,
      });
    };

    const stopDragging = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setInput("");
  };

  return (
    <div
      ref={dmRef}
      className="dm-window"
      style={{
        left: position.x !== null ? `${position.x}px` : 'auto',
        top: position.y !== null ? `${position.y}px` : 'auto',
        right: position.x === null ? '20px' : 'auto',
        bottom: position.y === null ? '20px' : 'auto',
        position: 'fixed',
      }}
    >
      <div className="dm-header" onMouseDown={handleMouseDown}>
        <span>Direct Message with <strong>{dmTarget}</strong></span>
        <button className="dm-close-button" onClick={onClose}>×</button>
      </div>
      <div className="dm-messages">
        {dmMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`dm-message ${msg.from === dmTarget ? "from-them" : "from-me"}`}
          >
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="dm-input-bar">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default DirectMessaging;