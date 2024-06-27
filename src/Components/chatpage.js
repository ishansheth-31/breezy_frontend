import React from 'react';

const AudioTest = () => {
  const playAudio = () => {
    const audio = new Audio('http://stream.live.vc.bbcmedia.co.uk/bbc_world_service');
    audio.play().catch((error) => {
      console.error("Error playing the audio:", error);
    });
  };

  return (
    <div>
      <button onClick={playAudio}>Play Audio</button>
    </div>
  );
};

export default AudioTest;
