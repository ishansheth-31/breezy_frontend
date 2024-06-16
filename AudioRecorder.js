import React, { useState } from 'react';

function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  let mediaRecorder;

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      setAudioBlob(audioBlob);
      // Here you can also send the blob to the server for transcription
    });

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
    mediaRecorder.addEventListener('dataavailable', async event => {
      const audioBlob = new Blob([event.data], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob);
  
      const response = await fetch('/transcribe_audio', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      console.log('Transcription:', data.transcription);
    });
  };  

  const handleRecordClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <button onClick={handleRecordClick}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}

export default AudioRecorder;
