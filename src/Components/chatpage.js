import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopIcon from "@mui/icons-material/Stop";
import audioServiceInstance from './audioService';

const ChatPage = ({
    patient_id,
    loading,
    setLoading,
    chatHistory,
    setChatHistory,
}) => {
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const [isConversationFinished, setIsConversationFinished] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [socket, setSocket] = useState(null);
    const [microphone, setMicrophone] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentResponse, setCurrentResponse] = useState("");
    const [latestAudioUrl, setLatestAudioUrl] = useState("");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [fullTranscript, setFullTranscript] = useState("");
    const [isTranscriptProcessing, setIsTranscriptProcessing] = useState(false);
    const [isReportGenerating, setIsReportGenerating] = useState(false);

    useEffect(() => {
        const socketIo = io("https://breezy-backend-de177311f71b.herokuapp.com");
        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setIsReportGenerating(true);
            const response = await axios.get(
                `https://breezy-backend-de177311f71b.herokuapp.com/report/${patient_id}`
            );
            console.log("Report:", response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
            setIsReportGenerating(false);
        }
    };

    const updateResponse = (response) => {
        setCurrentResponse(response);
    };

    const getMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
                ? "audio/mp4"
                : "audio/webm";
            const mic = new MediaRecorder(stream, { mimeType: mimeType });
            mic.ondataavailable = async (event) => {
                if (event.data.size > 0 && socket) {
                    socket.emit("audio_stream", event.data);
                }
            };
            mic.onstart = () => setIsRecording(true);
            mic.onstop = () => setIsRecording(false);
            return mic;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    };

    const startRecording = async () => {
        setIsProcessing(true);
        setIsTranscriptProcessing(true);
        const mic = await getMicrophone();
        setMicrophone(mic);
        mic.start(1000);
        setIsProcessing(false);
    };

    const stopRecording = async () => {
        setIsProcessing(true);
        setLoading(true);

        if (microphone) {
            microphone.stop();
            microphone.stream.getTracks().forEach((track) => track.stop());
            setMicrophone(null);
        }

        socket.emit("toggle_transcription", { action: "stop", patient_id });
    };

    const handlePlayAudio = async (audioUrl) => {
        try {
            setIsPlayingAudio(true);
            await audioServiceInstance.playAudio(audioUrl);
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setIsPlayingAudio(false);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on("transcription_response", async (data) => {
                const { user_message, response, finished } = data;
                setChatHistory((prevHistory) => [
                    ...prevHistory,
                    { role: "user", content: user_message },
                    { role: "assistant", content: response },
                ]);
                const audioUrl = await audioServiceInstance.fetchAudio(response);
                setLatestAudioUrl(audioUrl);
                updateResponse(response);
                setLoading(false);
                setIsProcessing(false);
                setIsTranscriptProcessing(false);

                if (audioUrl) {
                    try {
                        await handlePlayAudio(audioUrl);  // Play the nurse's response
                    } catch (error) {
                        console.error("Error playing audio:", error);
                    }
                }

                setIsConversationFinished(finished);
            });

            socket.on("current_transcript", (data) => {
                const { full_transcript } = data;
                setFullTranscript(full_transcript);
                setIsTranscriptProcessing(false);
            });

            socket.on("error", (data) => {
                console.error("Socket error:", data.error);
                alert(data.error);
            });

            return () => {
                socket.off("error");
                socket.off("current_transcript");
            };
        }
    }, [socket]);

    return (
        <div style={{ display: "flex", width: "100%", flexDirection: "column", padding: "15px", alignItems: "start" }}>
            <div style={{ display: "flex", height: "25%", width: "100%", flexDirection: "column" }}>
                <p style={{ fontWeight: "600", marginBottom: "10px" }}>Breezy Medical</p>
                <div style={{ display: "flex", width: "80%", alignItems: "center", backgroundColor: "#94d1f2", padding: "5px 10px", borderRadius: "10px", fontSize: "12px", marginTop: "10px" }}>
                    <p>
                        Meet your nurse, <strong>Ava</strong>. Please complete this short conversation so we can see you.
                    </p>
                </div>
            </div>
            <div style={{ display: "flex", width: "100%", height: "65%", alignItems: "start", flexDirection: "column", margin: "10px 0px" }}>
                <div className="chat-history" ref={chatHistoryRef} style={{ height: "100%", width: "100%", overflowY: "auto", border: "1px solid #94d1f2", borderRadius: "10px 0px 0px 10px" }}>
                    {chatHistory.map((msg, index) => (
                        <div key={index} style={{ marginBottom: "10px", padding: "10px" }} className={msg.role}>
                            <strong>{msg.role === "user" ? "You" : "Virtual Nurse"}:</strong> {msg.content}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: "flex", width: "100%", height: "10%", alignItems: "center", justifyContent: "center", flexDirection: "column", marginTop: "32px" }}>
                {!isConversationFinished && (
                    <div style={{ display: "flex", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
                        {!loading && !isPlayingAudio && (
                            <>
                                {!isRecording ? (
                                    <button
                                        style={{ borderColor: "#65C6FF", color: "#ffffff", borderRadius: "20px", padding: "10px 20px 10px 20px", border: "0px", backgroundColor: "#94d1f2", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                        onClick={() => {
                                            if (!isRecording && !isProcessing) {
                                                socket.emit("toggle_transcription", { action: "start" });
                                                startRecording();
                                            }
                                        }}
                                        disabled={isProcessing || (isRecording && !fullTranscript.trim())}
                                    >
                                        <KeyboardVoiceIcon />
                                    </button>
                                ) : (
                                    isTranscriptProcessing ? (
                                        <span style={{ fontWeight: "600", color: "#94d1f2" }}>Listening...</span>
                                    ) : (
                                        <button
                                            style={{ borderColor: "#65C6FF", color: "#ffffff", borderRadius: "20px", padding: "10px 20px 10px 20px", border: "0px", backgroundColor: "#94d1f2", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                            onClick={stopRecording}
                                            disabled={isProcessing || (isRecording && !fullTranscript.trim())}
                                        >
                                            <StopIcon />
                                        </button>
                                    )
                                )}
                            </>
                        )}
                        {(loading || isPlayingAudio) && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <CircularProgress />
                                {isReportGenerating && (
                                    <p style={{ marginTop: "10px", fontWeight: "600", color: "#94d1f2" }}>
                                        Please hold on while your report is being generated
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {isConversationFinished && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {isReportGenerating ? (
                            <p style={{ fontWeight: "600", marginBottom: "10px" }}>
                                Conversation finished, please wait for your report to generate!
                            </p>
                        ) : (
                            <p style={{ fontWeight: "600", marginBottom: "10px" }}>
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
