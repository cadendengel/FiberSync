import React from "react";
import { render, screen } from "@testing-library/react";
import ChatWindow from "../ChatWindow";
import "@testing-library/jest-dom";

describe("ChatWindow Component", () => {
     /* 
     * This test covers the placeholder messages for testing purposes.
     * In the future, when messages are dynamically retrieved from a backend,
     * these test cases should be updated to reflect the new data source.
     */
    test("renders messages correctly", () => {
      const messages = [
        { type: "message", user: "User1", text: "Hello!", timestamp: "2024-02-11T12:00:00Z" },
        { type: "message", user: "User2", text: "Welcome to FiberSync!", timestamp: "2024-02-11T12:01:00Z" }
      ];
  
      render(<ChatWindow messages={messages} />);
  
      // Function matchers to allow finding text split by elements
      expect(screen.getByText((content, element) => 
        element?.textContent === "User1: Hello!"
      )).toBeInTheDocument();
  
      expect(screen.getByText((content, element) => 
        element?.textContent === "User2: Welcome to FiberSync!"
      )).toBeInTheDocument();
    });

  test("scrolls to bottom when new messages appear", () => {
    const messages = [
      { user: "User1", text: "Hello!" },
      { user: "User2", text: "Welcome!" },
      { user: "User3", text: "This should be visible last" }
    ];

    const { container } = render(<ChatWindow messages={messages} />);
    const chatMessagesDiv = container.querySelector(".chat-messages");

    expect(chatMessagesDiv.scrollTop).toBe(chatMessagesDiv.scrollHeight - chatMessagesDiv.clientHeight);
  });

  test("renders long messages properly without breaking layout", () => {
    const longMessage = "This is a very long message that should wrap correctly inside the chat window without breaking the UI or overflowing.";
    const messages = [
      { type: "message", user: "User1", text: longMessage, timestamp: "2024-02-11T12:03:00Z" }
    ];

    render(<ChatWindow messages={messages} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

});
