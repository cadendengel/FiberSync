import './DevConsole.css';
import React, { useState } from "react";
import axios from "axios";

function DevConsole({ devpass }) {
    const [consoleOutput, setConsoleOutput] = useState("Output will appear here...");
    const [command, setCommand] = useState("");
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleCommandSubmit = async () => {
        if (!command.trim()) return; // Ignore empty commands

        if (command.trim() === "clear") {
            setConsoleOutput("Output will appear here..."); // Clear the console output
            setCommand(""); // Clear the command input
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/devconsole`, {
                command: command,
                devpass: devpass
            });
            setConsoleOutput((prevOutput) => `${prevOutput}\n> ${command}\n${response.data.output}`);
        } catch (error) {
            setConsoleOutput((prevOutput) => `${prevOutput}\n> ${command}\nError: ${error.message}`);
        }

        setCommand(""); // Clear the command input after submission
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div
            style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: 400,
                height: 300,
                border: "1px solid black",
            }}
            className="dev-console"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div
                className="console-header"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                style={{ cursor: "move", padding: "5px" }}
            >
                <h3>Dev Console</h3>
            </div>
            <div className="console-body">
                <textarea
                    className="console-output"
                    readOnly
                    value={consoleOutput}
                />
            </div>
            <div className="console-footer">
                <input
                    type="text"
                    className="console-input"
                    placeholder="Type a command..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleCommandSubmit();
                        }
                    }}
                />
                <button className="console-submit" onClick={handleCommandSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default DevConsole;