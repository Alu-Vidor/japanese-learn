import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isAnalyzing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { t } = useLanguage();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(t('micRequired'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isAnalyzing}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
          isAnalyzing ? 'bg-gray-200 cursor-wait' : 
          isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-yomi-500 text-white hover:bg-yomi-600'
        }`}
      >
        {isAnalyzing ? (
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        ) : isRecording ? (
          <Square className="w-8 h-8 fill-current" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>
      <p className="mt-3 text-sm font-medium text-gray-500">
        {isAnalyzing ? t('analyzing') : isRecording ? t('recording') : t('tapToRecord')}
      </p>
    </div>
  );
};