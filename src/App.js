import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormPage from "./Components/formpage";

function App() {
    const pathParts = window.location.href.split("/");
    const patient_id = pathParts[pathParts.length - 1];

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
    const [stageNumber, setStageNumber] = useState(-1);
    const [loading, setLoading] = useState(false);

    const handleSubmission = (input, stageNumber) => {
        const concatenatedInput = input.join(" ");
        const questionKey = Object.keys(initialQuestions)[stageNumber];
        const updatedQuestions = {
            ...initialQuestions,
            [questionKey]: concatenatedInput,
        };
        setInitialQuestions(updatedQuestions);
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `https://breezy-backend-de177311f71b.herokuapp.com/start/${patient_id}`,
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
                `https://breezy-backend-de177311f71b.herokuapp.com/chat/${patient_id}`,
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
            const response = await axios.get(
                `https://breezy-backend-de177311f71b.herokuapp.com/report/${patient_id}`
            );
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
                height: "100vh",
                justifyContent: "center",
                background: "white",
                color: "black",
            }}
        >
            {!isConversationStarted ? (
                (stageNumber === -1 && (
                    <FormPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={
                            "I become more intelligent the more you share, so I'll ask some questions that will aid me in assisting you."
                        }
                        handleSubmission={() => {
                            return;
                        }}
                        submitLabel={"Okay"}
                        inputs={[]}
                    />
                )) ||
                (stageNumber >= 0 && stageNumber <= 6 && (
                    <>
                        <FormPage
                            stageNumber={stageNumber}
                            setStageNumber={setStageNumber}
                            question={initialQuestions[stageNumber]}
                            handleSubmission={handleSubmission}
                            submitLabel={
                                stageNumber === 6 ? "Submit Reason" : "Next"
                            }
                            inputs={
                                stageNumber === 0
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Full Name",
                                          },
                                      ]
                                    : stageNumber === 1
                                    ? [
                                          {
                                              inputType: "number",
                                              inputLabel: "# Feet",
                                          },
                                          {
                                              inputType: "number",
                                              inputLabel: "# Inches",
                                          },
                                      ]
                                    : stageNumber === 2
                                    ? [
                                          {
                                              inputType: "number",
                                              inputLabel: "# Pounds",
                                          },
                                      ]
                                    : stageNumber === 3
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Medications (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 4
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Surgeries (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 5
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Drug Allergies (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 6
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Reason",
                                          },
                                      ]
                                    : []
                            }
                        />
                    </>
                )) ||
                (stageNumber === 7 && (
                    <FormPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={
                            "Thank you. Now you will begin a quick 5-minute conversation with our virtual nurse, Ava. This will save you the wait at the doctor’s office."
                        }
                        handleSubmission={startConversation}
                        submitLabel={"Start Conversation"}
                        inputs={[]}
                    />
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
