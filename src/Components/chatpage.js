import React, { useState, useEffect} from "react";
import axios from "axios";
import io from 'socket.io-client';
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopIcon from "@mui/icons-material/Stop";

const ChatPage = ({
    patient_id,
    loading,
    setLoading,
    chatHistory,
    setChatHistory,
}) => {
    const [userMessage, setUserMessage] = useState("");
    const [isConversationFinished, setIsConversationFinished] = useState(false);
    const [recording, setRecording] = useState(false);
    const [socket, setSocket] = useState(null); // Add state for socket
    const [microphone, setMicrophone] = useState(null); // Add state for the microphone
    const [isRecording, setIsRecording] = useState(false); // Add state for recording
    const [transcription, setTranscription] = useState('Realtime speech transcription'); // Add state for transcription


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

    const getMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mic = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mic.ondataavailable = async (event) => {
                if (event.data.size > 0 && socket) {
                    socket.emit("audio_stream", event.data);
                }
            };
            mic.onstart = () => {
                setIsRecording(true);
            };
            mic.onstop = () => {
                setIsRecording(false);
            };
            return mic;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    };

    const startRecording = async () => {
        const mic = await getMicrophone();
        setMicrophone(mic);
        mic.start(1000);
    };

    const stopRecording = () => {
        microphone.stop();
        microphone.stream.getTracks().forEach(track => track.stop());
        setMicrophone(null);
        if (isRecording && !isConversationFinished) {
            socket.emit("toggle_transcription", { action: "stop", patient_id: patient_id });
        }
    };

    useEffect(() => {
        // Establish the socket connection on component mount
        const socketIo = io("http://localhost:5003"); // Adjust URL/port as necessary
        setSocket(socketIo);

        socketIo.on("transcription_update", (data) => {
            setTranscription(data.transcription);
        });

        return () => {
            socketIo.disconnect();
        };
    }, []);

    const handleRecording = async () => {
        if (!recording) {
            startRecording();
            stopRecording();
        } else {
            stopRecording();
            sendMessage();
        }
        setRecording(!recording);
    };

    useEffect(() => {
        if (socket) {
            socket.on("transcription_update", (data) => {
                setTranscription(data.transcription);
            });
    
            socket.on('error', (data) => {
                alert(data.error);  // Display error message
            });
    
            socket.on('report_generated', (data) => {
                setIsConversationFinished(true);  // Set conversation as finished
                fetchReport();
            });
    
            // Proper cleanup to remove event listeners on component unmount
            return () => {
                socket.off("transcription_update");
                socket.off('error');
                socket.off('report_generated');
            };
        }
    }, [socket]);  // Depend on 'socket' to re-run this effect when it changes

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
                            // <button
                            //     onClick={sendMessage}
                            //     style={{
                            //         borderColor: "#65C6FF",
                            //         color: "#000000",
                            //         borderRadius: "20px",
                            //         padding: "10px 20px 10px 20px",
                            //         border: "1px solid",
                            //         backgroundColor: "#94d1f2",
                            //         fontSize: "12px",
                            //         fontWeight: "600",
                            //         cursor: "pointer",
                            //     }}
                            // >
                            //     Send
                            // </button>
                            <div>
                                <button
                                    style={{
                                        borderColor: "#65C6FF",
                                        color: "#ffffff",
                                        borderRadius: "20px",
                                        padding: "10px 20px 10px 20px",
                                        border: "0px",
                                        backgroundColor: "#94d1f2",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                    onClick={handleRecording}
                                >
                                    {!recording ? (
                                        <KeyboardVoiceIcon />
                                    ) : (
                                        <StopIcon />
                                    )}
                                </button>
                            </div>
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
