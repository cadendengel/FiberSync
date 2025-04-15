import './DevConsole.css';
import React, { useState } from "react";
import axios from "axios";

function DevConsole() {
    const [consoleOutput, setConsoleOutput] = useState("Output will appear here...");
    const [command, setCommand] = useState("");


    const handleCommandSubmit = async () => {
        if (!command.trim()) return; // Ignore empty commands

        if (command.trim() === "clear") {
            setConsoleOutput("Output will appear here..."); // Clear the console output
            setCommand(""); // Clear the command input
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/devconsole`, {
                command: command
            });
            setConsoleOutput((prevOutput) => `${prevOutput}\n> ${command}\n${response.data.output}`);
        } catch (error) {
            setConsoleOutput((prevOutput) => `${prevOutput}\n> ${command}\nError: ${error.message}`);
        }

        setCommand(""); // Clear the command input after submission
    };


    return (
        // New console window for dev console
        <div className="dev-console">
            <div className="console-header">
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