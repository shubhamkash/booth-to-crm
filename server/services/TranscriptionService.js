const axios = require('axios');

class TranscriptionService {
  static async transcribeAudio(audioFile) {
    try {
      // Mock implementation - replace with actual speech-to-text API
      // Example: OpenAI Whisper, Google Speech-to-Text, etc.
      
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        transcript: response.data.text
      };
    } catch (error) {
      console.error('Transcription failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fallback mock for development
  static async mockTranscribe(audioFile) {
    return {
      success: true,
      transcript: "Customer expressed strong interest in our enterprise solution. Mentioned they have 500+ employees and are looking to implement by Q1. Budget approved, decision maker present."
    };
  }
}

module.exports = TranscriptionService;