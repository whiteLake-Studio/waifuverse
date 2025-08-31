'use client';

import { motion } from 'framer-motion';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/contexts/AuthContext';

interface MainMenuProps {
  onNavigate: (screen: 'create' | 'private' | 'stream') => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <AuthButton />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          WaifuVerse
        </h1>
        <p className="text-purple-200 text-lg">Your AI Companion Awaits</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!isAuthenticated) {
              alert('Please sign in with Farcaster to create your waifu');
              return;
            }
            onNavigate('create');
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-semibold text-white shadow-lg relative"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">✨</span>
            <span>Create Your Waifu</span>
            {!isAuthenticated && (
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full ml-2">Sign in required</span>
            )}
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('private')}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-semibold text-white shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">💬</span>
            <span>Private Chat</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('stream')}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-semibold text-white shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">🎥</span>
            <span>Stream Mode</span>
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-purple-300 text-sm"
      >
        <p>Powered by AI • Built on Base</p>
      </motion.div>
    </div>
  );
}