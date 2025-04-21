import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DirectMessaging from "../DirectMessaging";
import "@testing-library/jest-dom";

describe("DirectMessaging Component", () => {
  const mockSend = jest.fn();
  const mockClose = jest.fn();
  const mockSocket = { emit: jest.fn() };

  const messages = [
    { from: "Alice", message: "Hello!" },
    { from: "Bob", message: "Hi!" },
    { from: "Alice", message: "How are you?" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders recipient name", () => {
    render(
      <DirectMessaging
        username="Alice"
        dmTarget="Bob"
        dmMessages={messages}
        onSend={mockSend}
        onClose={mockClose}
        dmRoom="room123"
        socket={mockSocket}
      />
    );

    // Because "Direct Message with" and "Bob" are split elements, had to use a "function matcher"
    expect(
      screen.getByText((content, node) =>
        node.textContent === "Direct Message with Bob"
      )
    ).toBeInTheDocument();
  });

  test("shows warning banner", () => {
    render(
      <DirectMessaging
        username="Alice"
        dmTarget="Bob"
        dmMessages={messages}
        onSend={mockSend}
        onClose={mockClose}
        dmRoom="room123"
        socket={mockSocket}
      />
    );
    expect(
      screen.getByText(/This is a temporary DM session/i)
    ).toBeInTheDocument();
  });

  test("renders messages correctly", () => {
    render(
      <DirectMessaging
        username="Alice"
        dmTarget="Bob"
        dmMessages={messages}
        onSend={mockSend}
        onClose={mockClose}
        dmRoom="room123"
        socket={mockSocket}
      />
    );

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("Hi!")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
  });

  test("typing and sending message works", () => {
    render(
      <DirectMessaging
        username="Alice"
        dmTarget="Bob"
        dmMessages={messages}
        onSend={mockSend}
        onClose={mockClose}
        dmRoom="room123"
        socket={mockSocket}
      />
    );

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByText("Send"));

    expect(mockSend).toHaveBeenCalledWith("Test message");
  });

  test("end session button works", () => {
    render(
      <DirectMessaging
        username="Alice"
        dmTarget="Bob"
        dmMessages={messages}
        onSend={mockSend}
        onClose={mockClose}
        onEndSession={mockClose}
        dmRoom="room123"
        socket={mockSocket} 
      />
    );
  
    fireEvent.click(screen.getByText("End Session"));
  
    expect(mockClose).toHaveBeenCalled();
  });
});
