jest.mock("axios", () => ({
  post: jest.fn(),
  delete: jest.fn()
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "../ChatWindow";
import "@testing-library/jest-dom";
import axios from "axios";

const mockUsername = "Chris";
const mockMessages = [
  {
    messageid: "1",
    user: "Chris",
    text: "Hello from me!",
    reactions: { "👍": 2 }
  },
  {
    messageid: "2",
    user: "SomeoneElse",
    text: "Hey there!",
    reactions: {}
  }
];

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("ChatWindow Component", () => {
  const onMessagesUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders messages with user and text", () => {
    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    expect(screen.getByText("Chris:")).toBeInTheDocument();
    expect(screen.getByText("Hello from me!")).toBeInTheDocument();
    expect(screen.getByText("SomeoneElse:")).toBeInTheDocument();
    expect(screen.getByText("Hey there!")).toBeInTheDocument();
  });

  test("renders reactions and handles click", async () => {
    axios.post.mockResolvedValue({});

    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    // Click button to open reaction options
    fireEvent.click(screen.getAllByText("➕")[0]);
    const emojiOption = screen.getByText("🔥");

    // Click on emoji
    fireEvent.click(emojiOption);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/api/messages/reactions"), {
        message_id: "1",
        emoji: "🔥",
        mode: "inc",
      });
    });
  });

  test("handles editing your own message", async () => {
    axios.post.mockResolvedValue({});

    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    // Click to start editing your own message
    fireEvent.click(screen.getAllByText("✏️")[0]);

    const input = screen.getByDisplayValue("Hello from me!");
    fireEvent.change(input, { target: { value: "Updated Message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/api/messages/edit"), {
        message_id: "1",
        text: "Updated Message"
      });
    });
  });

  test("prevents editing someone else's message", () => {
    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    // Click edit on another user's message
    fireEvent.click(screen.getAllByText("✏️")[1]);

    expect(screen.queryByDisplayValue("Hey there!")).not.toBeInTheDocument();
  });

  test("deletes your own message", async () => {
    axios.delete.mockResolvedValue({});

    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    fireEvent.click(screen.getAllByText("🗑️")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining("/api/messages/id"), {
        data: { messageid: "1" },
      });
    });
  });

  test("prevents deleting someone else's message", () => {
    render(<ChatWindow username={mockUsername} messages={mockMessages} onMessagesUpdate={onMessagesUpdate} />);

    fireEvent.click(screen.getAllByText("🗑️")[1]);

    expect(axios.delete).not.toHaveBeenCalled();
  });

  test("renders long message without breaking layout", () => {
    const longMessage = {
      messageid: "3",
      user: "Chris",
      text: "This is a long test message that should wrap nicely in the layout and not break any UI formatting issues.",
    };

    render(<ChatWindow username={mockUsername} messages={[longMessage]} onMessagesUpdate={onMessagesUpdate} />);
    expect(screen.getByText(longMessage.text)).toBeInTheDocument();
  });
});
