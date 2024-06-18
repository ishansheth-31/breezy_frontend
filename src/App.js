import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const App = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('Realtime speech transcription');
    const [socket, setSocket] = useState(null);
    const [microphone, setMicrophone] = useState(null);

    useEffect(() => {
        // Establish the socket connection on component mount
        const socketIo = io("http://localhost:5002"); // Adjust URL/port as necessary
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
        if (socket) {
            socket.emit("toggle_transcription", { action: "stop" });
        }
    };

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
