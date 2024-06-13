import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
    const pathParts = window.location.href.split('/');
    const patient_id = pathParts[pathParts.length - 1];
    console.log("URL:", window.location.href);
    console.log("Extracted patient ID:", patient_id);


    const [initialQuestions, setInitialQuestions] = useState({
        "What is your first and last name?": "",
        "What is your approximate height?": "4'0\"",
        "What is your approximate weight?": "",
        "Are you currently taking any medications?": "",
        "Have you had any recent surgeries?": "",
        "Do you have any known drug allergies?": "",
        "Finally, what are you in for today?": "",
    });
    const [chatHistory, setChatHistory] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [isConversationStarted, setIsConversationStarted] = useState(false);
    const [isConversationFinished, setIsConversationFinished] = useState(false);
    const [stageNumber, setStageNumber] = useState(0);
    const [height, setHeight] = useState("4'0\"");
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);

    const handleInitialQuestionsChange = (e) => {
        setInitialQuestions({
            ...initialQuestions,
            [e.target.name]: e.target.value,
        });
    };


    const handleInitialQuestionsChangeYN = (answer) => {
        setInitialQuestions({
            ...initialQuestions,
            [Object.keys(initialQuestions)[stageNumber - 1]]: answer,
        });
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `http://127.0.0.1:5000/start/${patient_id}`,
                initialQuestions,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setChatHistory([
                { role: "assistant", content: response.data.initial_response },
            ]);
            setIsConversationStarted(true);
            setLoading(false);
        } catch (error) {
            console.error("Error starting conversation:", error);
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `http://127.0.0.1:5000/chat/${patient_id}`,
                { message: userMessage },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setChatHistory([
                ...chatHistory,
                { role: "user", content: userMessage },
                { role: "assistant", content: response.data.response },
            ]);
            setUserMessage("");
            if (response.data.finished) {
                setIsConversationFinished(true);
                fetchReport();
            }
            setLoading(false);
        } catch (error) {
            console.error("Error sending message:", error);
            setLoading(false);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:5000/report/${patient_id}`);
            console.log("Report:", response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching report:", error);
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                width: "100vw",
                height: "100vh",
                textAlign: "center",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                justifyContent: "center",
                background: "white",
                color: "black",
            }}
        >
            {!isConversationStarted ? (
                (stageNumber === 0 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>BREEZY MEDICAL SURVEY</p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "500",
                                    marginBottom: "0px",
                                }}
                            >
                                Reduce your wait time
                            </p>
                            <p>
                                Take a few moments to complete your Breezy
                                assessment.
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setStageNumber(stageNumber + 1);
                                }}
                            >
                                Begin your assessment
                            </Button>
                        </div>
                    </div>
                )) ||
                (stageNumber === 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p style={{ fontSize: "24px" }}>
                                Welcome. I’m Ava, your virtual Nurse.
                            </p>
                            <p>
                                Let's get started.{" "}
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <TextField
                                style={{ marginBottom: "10px" }}
                                id="outlined-basic"
                                label="Name"
                                variant="outlined"
                                name={
                                    Object.keys(initialQuestions)[
                                        stageNumber - 1
                                    ]
                                }
                                onChange={handleInitialQuestionsChange}
                            />
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber + 1);
                                }}
                            >
                                Continue &gt;
                            </Button>
                        </div>
                    </div>
                )) ||
                (stageNumber === 2 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div>{height}</div>
                            <input
                                style={{
                                    borderColor: "#00A3FF",
                                    borderRadius: "30px",
                                    textAlign: "center",
                                    color: "#00A3FF",
                                    marginBottom: "10px",
                                    width: "12em",
                                    height: "1.5em",
                                }}
                                type="range"
                                min="48"
                                max="84"
                                name="height"
                                onChange={(event) => {
                                    const inches = event.target.value;
                                    const feet = Math.floor(inches / 12);
                                    const remainingInches = inches % 12;
                                    const newHeight = `${feet}'${remainingInches}"`;
                                    setHeight(newHeight);
                                    handleInitialQuestionsChange({
                                        target: {
                                            name: "What is your approximate height?",
                                            value: newHeight,
                                        },
                                    });
                                }}
                            />
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber + 1);
                                }}
                            >
                                Continue &gt;
                            </Button>
                        </div>
                    </div>
                )) ||
                (stageNumber === 3 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <TextField
                                style={{ marginBottom: "10px" }}
                                id="outlined-basic"
                                label="Weight (in lbs.)"
                                variant="outlined"
                                name={
                                    Object.keys(initialQuestions)[
                                        stageNumber - 1
                                    ]
                                }
                                onChange={handleInitialQuestionsChange}
                            />
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber + 1);
                                }}
                            >
                                Continue &gt;
                            </Button>
                        </div>
                    </div>
                )) ||
                (stageNumber === 4 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <TextField
                                    style={{
                                        marginRight: "10px",
                                    }}
                                    id="outlined-basic"
                                    label="List Medications"
                                    variant="outlined"
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onChange={handleInitialQuestionsChange}
                                />
                                <Button
                                    variant="contained"
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onClick={() => {
                                        handleInitialQuestionsChangeYN("None");
                                        setStageNumber(stageNumber + 1);
                                    }}
                                >
                                    None
                                </Button>
                            </div>
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber + 1);
                                }}
                            >
                                Continue &gt;
                            </Button>
                        </div>
                    </div>
                )) ||
                (stageNumber === 5 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div>
                                <Button
                                    variant="contained"
                                    style={{
                                        marginRight: "10px",
                                    }}
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onClick={() => {
                                        handleInitialQuestionsChangeYN("Yes");
                                        setStageNumber(stageNumber + 1);
                                    }}
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant="contained"
                                    style={{
                                        marginRight: "10px",
                                    }}
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onClick={() => {
                                        handleInitialQuestionsChangeYN("No");
                                        setStageNumber(stageNumber + 1);
                                    }}
                                >
                                    No
                                </Button>
                            </div>
                        </div>
                    </div>
                )) ||
                (stageNumber === 6 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div>
                                <Button
                                    variant="contained"
                                    style={{
                                        marginRight: "10px",
                                    }}
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onClick={() => {
                                        handleInitialQuestionsChangeYN("Yes");
                                        setStageNumber(stageNumber + 1);
                                    }}
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant="contained"
                                    style={{
                                        marginRight: "10px",
                                    }}
                                    name={
                                        Object.keys(initialQuestions)[
                                            stageNumber - 1
                                        ]
                                    }
                                    onClick={() => {
                                        handleInitialQuestionsChangeYN("No");
                                        setStageNumber(stageNumber + 1);
                                    }}
                                >
                                    No
                                </Button>
                            </div>
                        </div>
                    </div>
                )) ||
                (stageNumber === 7 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            width: "60%",
                        }}
                    >
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStageNumber(stageNumber - 1);
                                }}
                            >
                                &lt; Previous
                            </Button>
                            <img
                                style={{ width: "40px" }}
                                src="./Logo.svg"
                                alt="Logo"
                            />
                        </div>
                        <div
                            style={{
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <p>
                                {Object.keys(initialQuestions)[stageNumber - 1]}
                            </p>
                            <p
                                style={{
                                    fontSize: "12px",
                                    fontWeight: "300",
                                    width: "70%",
                                }}
                            >
                                *Disclaimer* After answering this question, you
                                will begin a 5 minute verbal conversation with
                                Ava. This will save you the wait at the doctor’s
                                office.
                            </p>
                        </div>
                        <div
                            style={{
                                height: "30%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <TextField
                                style={{ marginBottom: "10px", width: "40%" }}
                                id="outlined-basic"
                                label="Visit Reason"
                                variant="outlined"
                                name={
                                    Object.keys(initialQuestions)[
                                        stageNumber - 1
                                    ]
                                }
                                onChange={handleInitialQuestionsChange}
                            />
                            {!loading && (
                                <Button
                                    variant="text"
                                    onClick={startConversation}
                                >
                                    Start Conversation &gt;
                                </Button>
                            )}
                            {loading && <CircularProgress />}
                        </div>
                    </div>
                ))
            ) : (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <div style={{ width: "70%", height: "100%" }}>
                        <div
                            style={{
                                display: "flex",
                                height: "20%",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <p style={{ fontSize: "24px" }}>
                                    Meet your nurse:
                                </p>
                                <img
                                    style={{ width: "40px" }}
                                    src="./Logo.svg"
                                    alt="Logo"
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "start",
                                    fontSize: "20px",
                                }}
                            >
                                Ava
                            </div>
                        </div>
                        <div
                            className="chat-history"
                            style={{
                                border: "1px solid #1976D2",
                                borderRadius: "20px 0px 0px 20px",
                            }}
                        >
                            {chatHistory.map((msg, index) => (
                                <div
                                    style={{
                                        marginBottom: "20px",
                                    }}
                                    key={index}
                                    className={msg.role}
                                >
                                    <strong>
                                        {msg.role === "user"
                                            ? "You"
                                            : "Virtual Nurse"}
                                        :
                                    </strong>{" "}
                                    {msg.content}
                                </div>
                            ))}
                        </div>
                        {!isConversationFinished && (
                            <div
                                style={{
                                    display: "flex",
                                    height: "20%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <TextField
                                    style={{
                                        width: "30em",
                                        marginRight: "10px",
                                    }}
                                    type="text"
                                    value={userMessage}
                                    onChange={(e) =>
                                        setUserMessage(e.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                />
                                {!loading && (
                                    <Button
                                        variant="contained"
                                        onClick={sendMessage}
                                    >
                                        Send
                                    </Button>
                                )}
                                {loading && <CircularProgress />}
                            </div>
                        )}
                        {isConversationFinished && (
                            <div
                                style={{
                                    display: "flex",
                                    height: "20%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                }}
                            >
                                <h2>Conversation Finished!</h2>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;