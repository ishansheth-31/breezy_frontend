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

    const splitTextIntoChunks = (text, chunkSize = 200) => {
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
        }
        return chunks;
    };

    const fetchAndPlayAudio = async (responseText) => {
        const options = {
            method: 'POST',
            headers: {
                'xi-api-key': '4e0f2a69188f25172725c65b23e2286a',
                'Content-Type': 'application/json'
            }
        };
    
        const textChunks = splitTextIntoChunks(responseText);
    
        for (const chunk of textChunks) {
            const requestOptions = {
                ...options,
                body: JSON.stringify({
                    text: chunk,
                    voice_settings: {
                        stability: 1,
                        similarity_boost: 0
                    }
                })
            };
    
            try {
                const apiResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream', requestOptions);
                if (!apiResponse.ok) throw new Error(`API response not OK, status: ${apiResponse.status}`);
    
                const contentType = apiResponse.headers.get('content-type');
                if (contentType && contentType.startsWith('audio/')) {
                    const blob = await apiResponse.blob();
                    const url = URL.createObjectURL(blob);
                    await playAudioFromUrl(url); // Ensure the audio plays sequentially
                } else if (contentType && contentType.includes('application/json')) {
                    const json = await apiResponse.json();
                    console.error('Expected audio, got JSON:', json);
                } else {
                    throw new Error("Unexpected content type: " + contentType);
                }
            } catch (err) {
                console.error('Error fetching TTS data:', err);
            }
        }
    };    
    
    const playAudioFromUrl = (audioUrl) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            audio.onended = resolve; // Resolve the promise when the audio ends
            audio.onerror = (error) => {
                console.error('Error playing the audio:', error);
                reject(error);
            };
            audio.play().then(() => {
                console.log('Playing audio from URL:', audioUrl);
            }).catch(error => {
                console.error('Error playing the audio:', error);
                reject(error);
            });
        });
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
            await fetchAndPlayAudio('The sun rises over the horizon casting a golden glow across the fields birds begin to sing their morning songs as the world awakens the gentle breeze carries the scent of blooming flowers and fresh grass children laugh and play chasing each other through the open meadows the farmers begin their work tending to the crops and animals with care the peaceful rhythm of nature continues uninterrupted a reminder of the simple beauty of life as the day progresses the warmth of the sun intensifies filling the air with a comfortable heat that invites relaxation and joy families gather for picnics under the shade of ancient oak trees spreading out blankets and sharing meals while engaging in lively conversations the sound of laughter and happiness echoes through the valleys as people take a moment to appreciate the simple pleasures of life the animals in the nearby forests go about their day the deer grazing on tender shoots the birds flitting from branch to branch in a graceful dance as the afternoon turns into evening the sky transforms into a canvas of brilliant colors with hues of pink orange and purple painting the heavens as the sun dips below the horizon the first stars begin to twinkle against the deepening blue of the twilight sky the air cools and the sounds of the night emerge crickets chirp softly in the distance while a gentle rustling in the trees suggests the presence of nocturnal creatures the world slowly quiets down the energy of the day giving way to the calm of the night people return to their homes tired but content ready to rest and rejuvenate for another day to come the cycle of life continues a seamless blend of activity and tranquility where every moment holds its own unique charm and beauty');
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

