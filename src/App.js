import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import "./App.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const App = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('Realtime speech transcription');
    const [socket, setSocket] = useState(null);
    const [microphone, setMicrophone] = useState(null);
    const pathParts = window.location.href.split('/');
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
                `http://127.0.0.1:5003/start/${patient_id}`,
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

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:5003/report/${patient_id}`);
            console.log("Report:", response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching report:", error);
            setLoading(false);
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
        <div className="content">
            <div className="button-container">
                <button className={`mic-button ${isRecording ? 'recording' : ''}`} onClick={() => {
                    if (!isRecording) {
                        socket.emit("toggle_transcription", { action: "start" });
                        startRecording();
                    } else {
                        stopRecording();
                    }
                }}>
                    {isRecording ? 'STOP' : 'START'}
                </button>
            </div>
            <h1>Captions</h1>
            <div className="captions" id="captions">{transcription}</div>
        </div>
    );
};

export default App;
