import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
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
    const chatHistoryRef = useRef(null); // Create a ref for the chat history container

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop =
                chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]); // Scroll to bottom whenever chat history updates

    const [isConversationFinished, setIsConversationFinished] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState(
        "Realtime speech transcription"
    );
    const [socket, setSocket] = useState(null);
    const [microphone, setMicrophone] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetchingReport, setIsFetchingReport] = useState(false);

    const fetchReport = async () => {
        try {
            setLoading(true); // Set loading to true when fetching the report
            const response = await axios.get(
                `https://breezy-backend-de177311f71b.herokuapp.com/report/${patient_id}`
            );
            console.log("Report:", response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false); // Set loading to false after fetching the report
        }
    };

    const playAudioFromUrl = (audioUrl) => {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.error('Error playing the audio:', error));
    };

    const fetchAndPlayAudio = async (responseText) => {
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': '4e0f2a69188f25172725c65b23e2286a',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: responseText,
                voice_settings: {
                    stability: 1,
                    similarity_boost: 0
                }
            })
        };
    
        try {
            const apiResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream', options);
            if (!apiResponse.ok) throw new Error(`API response not OK, status: ${apiResponse.status}`);
            
            const contentType = apiResponse.headers.get('content-type');
            if (contentType && contentType.startsWith('audio/')) {
                const blob = await apiResponse.blob();
                const url = URL.createObjectURL(blob);
                playAudioFromUrl(url);
            } else if (contentType && contentType.includes('application/json')) {
                const json = await apiResponse.json();
                console.error('Expected audio, got JSON:', json);
            } else {
                throw new Error("Unexpected content type: " + contentType);
            }
        } catch (err) {
            console.error('Error fetching TTS data:', err);
        }
    };


    useEffect(() => {
        const socketIo = io(
            "https://breezy-backend-de177311f71b.herokuapp.com"
        );
        setSocket(socketIo);

        socketIo.on("transcription_update", (data) => {
            setTranscription(data.transcription);
        });

        socketIo.on("transcription_response", async (data) => {
            const { user_message, response, finished } = data;
            

            setChatHistory((prevHistory) => [
                ...prevHistory,
                { role: "user", content: user_message },
                { role: "assistant", content: response },
            ]);
            await fetchAndPlayAudio('Fuckkkkkkkkkk its still not working. I really need all hands on deck tm bc we need to get this out It’s one thing that needs to be fixed. I need someone to look into assemblyai streaming text length and if there are any parameters we can add there Also someone look into potentially putting this in the backend, generating an mp3 file and calling the mp3 Yash since you have the code base maybe let Aidan smith have a look. But please we need to get this done tm asap. What time can everyone work 11 lab will not work with longer and more complex responses that take more time to generate. I’m not really sure if it’s a latency or network or timing thing but we should try to troubleshoot this. There’s also the possibility of it being 11 lab saying that we can’t really control so I’m starting to think that we might need to move over to another API, especially for the sake of speed');
            setIsProcessing(false);
            setLoading(false);
            setIsConversationFinished(finished);
        });

        return () => {
            socketIo.disconnect();
        };
    }, []);

    const getMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
                ? "audio/mp4"
                : "audio/webm";
            const mic = new MediaRecorder(stream, { mimeType: mimeType });
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
        setIsProcessing(true);
        const mic = await getMicrophone();
        setMicrophone(mic);
        mic.start(1000);
        setIsProcessing(false);
    };

    const stopRecording = () => {
        setIsProcessing(true);
        setLoading(true); // Set loading to true when stopping the recording
        if (microphone) {
            microphone.stop();
            microphone.stream.getTracks().forEach((track) => track.stop());
            setMicrophone(null);
        }
        setIsProcessing(false);
        socket.emit("toggle_transcription", { action: "stop", patient_id });
    };

    useEffect(() => {
        if (socket) {
            socket.on("transcription_update", (data) => {
                setTranscription(data.transcription);
            });

            socket.on("error", (data) => {
                alert(data.error);
            });

            socket.on("report_generated", (data) => {
                setIsConversationFinished(true);
                fetchReport();
            });

            return () => {
                socket.off("transcription_update");
                socket.off("error");
                socket.off("report_generated");
            };
        }
    }, [socket]);

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
                <p style={{ fontWeight: "600", marginBottom: "10px" }}>
                    Breezy Medical
                </p>
                <div
                    style={{
                        display: "flex",
                        width: "80%",
                        alignItems: "center",
                        backgroundColor: "#94d1f2",
                        padding: "5px 10px",
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
                    ref={chatHistoryRef} // Assign the ref to the chat history container
                    style={{
                        height: "100%",
                        width: "100%",
                        overflowY: "auto",
                        border: "1px solid #94d1f2",
                        borderRadius: "10px 0px 0px 10px",
                    }}
                >
                    {chatHistory.map((msg, index) => (
                        <div
                            key={index}
                            style={{ marginBottom: "10px", padding: "10px" }}
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
                        {!loading && !isFetchingReport && (
                            <>
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
                                    onClick={() => {
                                        if (!isRecording && !isProcessing) {
                                            socket.emit(
                                                "toggle_transcription",
                                                { action: "start" }
                                            );
                                            startRecording();
                                        } else {
                                            stopRecording();
                                        }
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isRecording ? (
                                        <StopIcon />
                                    ) : (
                                        <KeyboardVoiceIcon />
                                    )}
                                </button>
                            </>
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
                            textAlign: "center",
                        }}
                    >
                        {isFetchingReport && (
                            <p
                                style={{
                                    fontWeight: "600",
                                    marginBottom: "10px",
                                }}
                            >
                                Conversation finished, please wait for your
                                report to generate!
                            </p>
                        )}
                        {!isFetchingReport && (
                            <p
                                style={{
                                    fontWeight: "600",
                                    marginBottom: "10px",
                                }}
                            >
                                Conversation finished! You may leave this page!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;

