'use client'

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function YHWHVideo({
  artistName = "YHWH",
  songTitle = "Untitled Track",
  className = "",
  showControls = true
}) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(console.error);
    }
  }, []);

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
      >
        <source src="/YAHWEH - Angeloh, CalledOut Music & Tbabz [Lyric Video].mp4" type="video/mp4" />
        <source src="/videos/yhwh-track.mp4" type="video/mp4" />
        <source src="/videos/yhwh-track.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Artist name and song title - no box, just text with shadow */}
      <div className="absolute bottom-4 left-4 text-white">
        <p className="font-bold text-lg drop-shadow-lg text-shadow-lg">{artistName}</p>
        <p className="text-sm opacity-90 drop-shadow-md">{songTitle}</p>
      </div>
      
      {showControls && (
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={toggleMute}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white transition-all duration-300"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
