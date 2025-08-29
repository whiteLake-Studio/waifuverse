'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WaifuVideoProps {
  className?: string;
  onVideoEnd?: () => void;
}

export default function WaifuVideo({ className = '', onVideoEnd }: WaifuVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Available videos
  const videos = [
    '/videos/waifu-00.mp4',
    '/videos/waifu-01.mp4',
    '/videos/waifu-02.mp4',
  ];

  // Function to play a specific video
  const playVideo = (index: number) => {
    if (index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    }
  };

  // Function to play a random video
  const playRandomVideo = () => {
    const randomIndex = Math.floor(Math.random() * videos.length);
    playVideo(randomIndex);
  };

  // Function to play next video in sequence
  const playNextVideo = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    playVideo(nextIndex);
  };

  // Expose functions through window for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).waifuVideo = {
        playVideo,
        playRandomVideo,
        playNextVideo,
        currentIndex: currentVideoIndex,
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).waifuVideo;
      }
    };
  }, [currentVideoIndex]);

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
    // Loop the same video by default
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error looping video:', err);
      });
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-purple-900/50 to-black/50 rounded-2xl"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">💕</div>
            <p className="text-white text-lg">Loading waifu...</p>
          </div>
        </motion.div>
      )}
      
      <video
        ref={videoRef}
        src={videos[currentVideoIndex]}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        onEnded={handleVideoEnd}
        onLoadedData={handleLoadedData}
      >
        Your browser does not support the video tag.
      </video>

      {/* Video Controls Overlay (for debugging, can be removed later) */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => playVideo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentVideoIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Play video ${index}`}
          />
        ))}
      </div>
    </div>
  );
}

// Export utility functions for external use
export const waifuVideoControls = {
  playVideo: (index: number) => {
    if (typeof window !== 'undefined' && (window as any).waifuVideo) {
      (window as any).waifuVideo.playVideo(index);
    }
  },
  playRandomVideo: () => {
    if (typeof window !== 'undefined' && (window as any).waifuVideo) {
      (window as any).waifuVideo.playRandomVideo();
    }
  },
  playNextVideo: () => {
    if (typeof window !== 'undefined' && (window as any).waifuVideo) {
      (window as any).waifuVideo.playNextVideo();
    }
  },
};