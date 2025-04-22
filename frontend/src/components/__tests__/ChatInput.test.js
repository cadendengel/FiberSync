import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatInput from "../ChatInput";
import "@testing-library/jest-dom";

// All required ChatInput tests completed as per Testing Plan (SCRUM-119) - Chris 4/10/25

describe("ChatInput Component - Unit Tests", () => {
    test("Typing updates the input field", () => {
    render(<ChatInput onSendMessage={() => {}} />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    
    // Simulate typing
    fireEvent.change(inputField, { target: { value: "Hello FiberSync!" } });

    // Expect the input field to contain the text
    expect(inputField.value).toBe("Hello FiberSync!");
  });

  test("Clicking send button submits the message", () => {
    const mockSendMessage = jest.fn();
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    // Simulate typing and clicking send
    fireEvent.change(inputField, { target: { value: "Test Message" } });
    fireEvent.click(sendButton);

    // Expect mock function to be called with the correct message
    expect(mockSendMessage).toHaveBeenCalledWith("Test Message");
  });

  // Kind of a duplicate of previous test, but confirms enter works as well
  test("Pressing Enter submits the message", () => {
    const mockSendMessage = jest.fn();
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const inputField = screen.getByPlaceholderText("Type a message...");

    // Simulate typing and pressing enter
    fireEvent.change(inputField, { target: { value: "Enter Message" } });
    fireEvent.keyDown(inputField, { key: "Enter", code: "Enter" });

    // Expect mock function to be called
    expect(mockSendMessage).toHaveBeenCalledWith("Enter Message");
  });

  test("Input clears after sending message", () => {
    render(<ChatInput onSendMessage={() => {}} />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    fireEvent.change(inputField, { target: { value: "Clear Test" } });
    fireEvent.click(sendButton);

    // Expect input field to be empty after sending
    expect(inputField.value).toBe("");
  });

  test("Send button is disabled for empty input", () => {
    render(<ChatInput onSendMessage={() => {}} />);
    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeDisabled();
  });

  // We probably want to be able to send empty messages eventually, so this test is temporary.
  test("Empty messages are not sent", () => {
    const mockSendMessage = jest.fn();
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const sendButton = screen.getByText("Send");

    // Simulate clicking send with an empty message
    fireEvent.click(sendButton);

    // Ensure send function was never called
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
