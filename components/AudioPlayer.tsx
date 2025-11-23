import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string | undefined;
  label?: string;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, label, autoPlay = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current && autoPlay && src) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // Autoplay might be prevented by browser policy or invalid source
          console.debug("Autoplay prevented or failed:", e);
          setIsPlaying(false);
        });
      }
    }
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current || !src) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePlay}
        disabled={!src}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          src ? 'bg-yomi-100 text-yomi-600 hover:bg-yomi-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>
      {label && <span className="text-sm text-gray-600 font-medium">{label}</span>}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};