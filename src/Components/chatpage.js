import React, { useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const ChatPage = ({
    patient_id,
    loading,
    setLoading,
    chatHistory,
    setChatHistory,
}) => {
    const [userMessage, setUserMessage] = useState("");
    const [isConversationFinished, setIsConversationFinished] = useState(false);

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
            const response = await axios.get(
                `http://127.0.0.1:5000/report/${patient_id}`
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
                width: "100%",
                flexDirection: "column",
                padding: "15px",
                alignItems: "start",
            }}
        >
            <div
                style={{
                    display: "flex",
                    height: "25%",
                    width: "100%",
                    flexDirection: "column",
                }}
            >
                <p
                    style={{
                        fontWeight: "600",
                        marginBottom: "10px",
                    }}
                >
                    Breezy Medical
                </p>
                <div
                    style={{
                        display: "flex",
                        width: "80%",
                        alignItems: "center",
                        backgroundColor: "#94d1f2",
                        padding: "5px 10px 5px 10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        marginTop: "10px",
                    }}
                >
                    <p>
                        Meet your nurse, <strong>Ava</strong>. Please complete
                        this short conversation so we can see you.
                    </p>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    height: "65%",
                    alignItems: "start",
                    flexDirection: "column",
                    margin: "10px 0px",
                }}
            >
                <div
                    className="chat-history"
                    style={{
                        height: "100%",
                        border: "1px solid #94d1f2",
                        borderRadius: "10px 0px 0px 10px",
                    }}
                >
                    {chatHistory.map((msg, index) => (
                        <div
                            style={{
                                marginBottom: "10px",
                                padding: "10px",
                            }}
                            key={index}
                            className={msg.role}
                        >
                            <strong>
                                {msg.role === "user" ? "You" : "Virtual Nurse"}:
                            </strong>{" "}
                            {msg.content}
                        </div>
                    ))}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    height: "10%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                {!isConversationFinished && (
                    <div
                        style={{
                            display: "flex",
                            height: "100%",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <input
                            style={{
                                height: "28px",
                                width: "60%",
                                borderTop: "none",
                                borderLeft: "none",
                                borderRight: "none",
                                borderBottom: "1px solid",
                                fontSize: "18px",
                                marginRight: "20px",
                                borderRadius: "0px",
                            }}
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    sendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                        />
                        {!loading && (
                            <button
                                onClick={sendMessage}
                                style={{
                                    borderColor: "#65C6FF",
                                    color: "#000000",
                                    borderRadius: "20px",
                                    padding: "10px 20px 10px 20px",
                                    border: "1px solid",
                                    backgroundColor: "#94d1f2",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Send
                            </button>
                        )}
                        {loading && <CircularProgress />}
                    </div>
                )}
                {isConversationFinished && (
                    <div
                        style={{
                            display: "flex",
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                        }}
                    >
                        <p
                            style={{
                                fontWeight: "600",
                                marginBottom: "10px",
                            }}
                        >
                            Conversation Finished!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
