import React, { useState, useRef, useEffect } from 'react';
import { AudioRecorder } from '../utils/audioRecorder';

const VoiceRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    if (!AudioRecorder.isSupported()) {
      setError('Audio recording not supported in this browser');
      return;
    }

    try {
      setError('');
      setTranscript('');
      
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.startRecording();
      
      // Start speech recognition if supported
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Starting speech recognition...');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Show interim results immediately for faster response
          if (interimTranscript || finalTranscript) {
            setTranscript(prev => {
              // Replace interim with final, or show interim if no final yet
              const baseTranscript = prev.replace(/\[interim\].*$/, '');
              if (finalTranscript) {
                return baseTranscript + finalTranscript;
              } else {
                return baseTranscript + '[interim] ' + interimTranscript;
              }
            });
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied');
          }
        };
        
        recognitionRef.current.start();
      } else {
        console.warn('Speech recognition not supported');
        setError('Speech recognition not supported in this browser');
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Recording error:', err);
      setError(err.message || 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      const audioBlob = await recorderRef.current.stopRecording();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      setIsRecording(false);
      clearInterval(timerRef.current);
      
      if (audioBlob && onRecordingComplete) {
        // Clean transcript before sending (remove interim markers)
        const cleanTranscript = transcript.replace(/\[interim\]\s*/g, '').trim();
        console.log('=== FRONTEND TRANSCRIPT ===');
        console.log('Transcript to send:', cleanTranscript);
        console.log('Transcript length:', cleanTranscript?.length);
        console.log('========================');
        onRecordingComplete(audioBlob, cleanTranscript);
      }
    } catch (err) {
      setError('Failed to stop recording');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Voice Note</h3>
        
        {/* Recording Status */}
        <div className="mb-6">
          {isRecording ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
              </div>
              {transcript && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-left max-h-20 overflow-y-auto">
                  {transcript}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              {recordingTime > 0 ? `Last recording: ${formatTime(recordingTime)}` : 'Tap to record conversation notes'}
            </p>
          )}
        </div>

        {/* Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl ${
            isRecording 
              ? 'bg-red-500 active:bg-red-600' 
              : 'bg-primary-600 active:bg-primary-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4">
          {isRecording ? 'Speaking... (Chrome/Edge work best)' : 'Record key conversation points'}
        </p>
        
        {!transcript && isRecording && (
          <p className="text-xs text-yellow-600 mt-2">
            Allow microphone access for speech-to-text
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;