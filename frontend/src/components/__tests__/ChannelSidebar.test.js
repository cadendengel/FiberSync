jest.mock("axios", () => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  }));
  
jest.mock("socket.io-client", () => ({
    io: () => ({
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn(),
    }),
}));
  
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChannelSidebar from "../ChannelSidebar";
import "@testing-library/jest-dom";
import axios from "axios";

const mockChannels = [{ name: "Home" }, { name: "General" }, { name: "Gaming" }];

describe("ChannelSidebar Component", () => {
  let setActiveChannel;

  beforeEach(() => {
    setActiveChannel = jest.fn();
    axios.get.mockResolvedValue({ data: mockChannels });
    jest.clearAllMocks();
  });

  test("renders channel list", async () => {
    render(<ChannelSidebar activeChannel="Home" setActiveChannel={setActiveChannel} />);

    await waitFor(() => {
      mockChannels.forEach(channel => {
        expect(screen.getByText(channel.name)).toBeInTheDocument();
      });
    });
  });

  test("clicking Create Channel toggles input box", async () => {
    render(<ChannelSidebar activeChannel="Home" setActiveChannel={setActiveChannel} />);

    const button = screen.getByText("Create Channel");
    fireEvent.click(button);
    expect(screen.getByPlaceholderText("Enter Channel Name")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByPlaceholderText("Enter Channel Name")).not.toBeInTheDocument();
  });

  test("creates a channel and updates list", async () => {
    axios.post.mockResolvedValue({});
    axios.get.mockResolvedValueOnce({ data: mockChannels }); // Initial load
    axios.get.mockResolvedValueOnce({ data: [...mockChannels, { name: "NewChannel" }] }); // After creation

    render(<ChannelSidebar activeChannel="Home" setActiveChannel={setActiveChannel} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Gaming")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create Channel"));
    fireEvent.change(screen.getByPlaceholderText("Enter Channel Name"), { target: { value: "NewChannel" } });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("NewChannel")).toBeInTheDocument();
    });
  });

  test("clicking a channel switches active channel", async () => {
    render(<ChannelSidebar activeChannel="Home" setActiveChannel={setActiveChannel} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Gaming"));
      expect(setActiveChannel).toHaveBeenCalledWith("Gaming");
    });
  });

  test("prevents channel creation if over 5 channels", async () => {
    const fiveChannels = [
      { name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }
    ];
    axios.get.mockResolvedValueOnce({ data: fiveChannels });

    render(<ChannelSidebar activeChannel="One" setActiveChannel={setActiveChannel} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create Channel"));
    });

    fireEvent.change(screen.getByPlaceholderText("Enter Channel Name"), {
      target: { value: "ExtraChannel" }
    });

    window.alert = jest.fn(); // Mock alert
    fireEvent.click(screen.getByText("Create"));

    expect(window.alert).toHaveBeenCalledWith("Channel limit reached!");
  });

  test("handles axios error when fetching channels", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
  
    render(<ChannelSidebar activeChannel="Home" setActiveChannel={setActiveChannel} />);
  
    await waitFor(() => {
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
    });
  });
});
