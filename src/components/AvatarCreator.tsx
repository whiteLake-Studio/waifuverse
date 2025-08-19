'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AvatarCreatorProps {
  onAvatarCreated: (avatarUrl: string) => void;
  onBack: () => void;
}

export default function AvatarCreator({ onAvatarCreated, onBack }: AvatarCreatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    // Check if the message is from Ready Player Me
    if (event.data?.source !== 'readyplayerme') return;

    // Handle different event types
    switch (event.data.eventName) {
      case 'v1.frame.ready':
        // iframe is ready
        setIsLoading(false);
        console.log('Ready Player Me iframe is ready');
        break;
      
      case 'v1.avatar.exported':
        // Avatar has been created
        const url = event.data.data?.url;
        if (url) {
          console.log('Avatar created:', url);
          setAvatarUrl(url);
          // Save to localStorage for persistence
          localStorage.setItem('waifuverse_avatar_url', url);
          onAvatarCreated(url);
        }
        break;
      
      case 'v1.user.set':
        // User has logged in or selected an existing avatar
        console.log('User set:', event.data);
        break;
    }
  }, [onAvatarCreated]);

  useEffect(() => {
    // Add event listener for Ready Player Me messages
    window.addEventListener('message', handleMessage);
    
    // Check for existing avatar
    const existingAvatar = localStorage.getItem('waifuverse_avatar_url');
    if (existingAvatar) {
      setAvatarUrl(existingAvatar);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-12 bg-black/20 backdrop-blur-sm">
        <button onClick={onBack} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Create Your Waifu</h2>
        <div className="w-6"></div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-800 p-6 rounded-2xl text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading Avatar Creator...</p>
            <p className="text-sm text-purple-200 mt-2">Please wait</p>
          </motion.div>
        </div>
      )}

      {/* Ready Player Me Iframe */}
      <div className="flex-1 relative">
        <iframe
          id="rpm-avatar-creator"
          src="https://waifuverse.readyplayer.me/avatar?frameApi"
          className="w-full h-full border-0"
          allow="camera; microphone"
          title="Ready Player Me Avatar Creator"
        />
      </div>

      {/* Avatar URL Display (for debugging) */}
      {avatarUrl && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-purple-900/90 backdrop-blur-sm p-4"
        >
          <p className="text-sm text-purple-200 mb-2">Avatar Created Successfully!</p>
          <p className="text-xs text-purple-300 truncate">URL: {avatarUrl}</p>
          <button
            onClick={() => onAvatarCreated(avatarUrl)}
            className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-xl font-semibold"
          >
            Use This Avatar
          </button>
        </motion.div>
      )}
    </div>
  );
}