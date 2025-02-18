import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../App";
import "@testing-library/jest-dom";

describe("Primary Chat Channel - Integration Tests", () => {
  test("User can send a message and it appears in ChatWindow", () => {
    render(<App />);

    // Click to enter the chat, may need to modify with Username implementation
    const entryBox = screen.getByText("FiberSync");
    fireEvent.click(entryBox);

    // Find chat input field & send button
    const inputField = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    // Simulate typing a message
    fireEvent.change(inputField, { target: { value: "This is a Test Message" } });

    // Simulate clicking Send
    fireEvent.click(sendButton);

    // Verify the message appears in ChatWindow
    expect(screen.getByText("You:")).toBeInTheDocument(); // "You" will need to be changed with username implementation
    expect(screen.getByText("This is a Test Message")).toBeInTheDocument();
  });

  test("Auto-scroll moves to the latest message", () => {
    const { container } = render(<App />);
    
    // Click to enter the chat
    const entryBox = screen.getByText("FiberSync");
    fireEvent.click(entryBox);

    const inputField = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    // Simulate sending multiple messages to create overflow
    for (let i = 0; i < 20; i++) {
      fireEvent.change(inputField, { target: { value: `Message ${i + 1}` } });
      fireEvent.click(sendButton);
    }

    // Get the chat message container
    const chatMessages = container.querySelector(".chat-messages");

    // Expect the chat container to be scrolled to the bottom
    expect(chatMessages.scrollTop).toBe(chatMessages.scrollHeight - chatMessages.clientHeight);
  });

  test("User's message does not stay in chat input after sending", () => {
    render(<App />);

    // Click to enter the chat
    const entryBox = screen.getByText("FiberSync");
    fireEvent.click(entryBox);

    const inputField = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    // Type and send a message
    fireEvent.change(inputField, { target: { value: "Another Test" } });
    fireEvent.click(sendButton);

    // Ensure the input field is cleared after sending
    expect(inputField.value).toBe("");
  });
});
