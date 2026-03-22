import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend }) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onSend(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
        recording ? 'text-red-500 animate-pulse' : ''
      }`}
    >
      {recording ? <Square size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceRecorder;
