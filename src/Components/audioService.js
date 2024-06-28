// audioService.js
class AudioService {
    constructor() {
      if (!AudioService.instance) {
        this.audioContext = new AudioContext();
        AudioService.instance = this;
      }
      return AudioService.instance;
    }
  
    async fetchAudio(responseText) {
      const options = {
        method: "POST",
        headers: {
          "xi-api-key": "4e0f2a69188f25172725c65b23e2286a",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: responseText,
          voice_settings: {
            stability: 1,
            similarity_boost: 0,
          },
        }),
      };
  
      try {
        const apiResponse = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream",
          options
        );
        if (!apiResponse.ok) throw new Error(`API response not OK, status: ${apiResponse.status}`);
  
        const contentType = apiResponse.headers.get("content-type");
        if (contentType && contentType.startsWith("audio/")) {
          const blob = await apiResponse.blob();
          const url = URL.createObjectURL(blob);
          return url;
        } else if (contentType && contentType.includes("application/json")) {
          const json = await apiResponse.json();
          console.error("Expected audio, got JSON:", json);
        } else {
          throw new Error("Unexpected content type: " + contentType);
        }
      } catch (err) {
        console.error("Error fetching TTS data:", err);
      }
    }
  
    playAudio(audioUrl) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          resolve();
          audio.src = '';
        };
        audio.onerror = (error) => {
          console.error("Error playing the audio:", error);
          reject(error);
        };
        audio.play().catch((error) => {
          console.error("Error playing the audio:", error);
          reject(error);
        });
      });
    }
  }
  
  const instance = new AudioService();
  Object.freeze(instance);
  
  export default instance;
  