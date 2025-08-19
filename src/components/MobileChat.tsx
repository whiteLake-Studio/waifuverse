'use client';

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationFromText, simulateLipSync, AnimationQueue } from '@/utils/animationController';
import { WaifuModel } from '@/types/waifu';

// Lazy load the 3D component to improve initial load time
const Avatar3D = lazy(() => import('@/components/Avatar3D'));

interface MobileChatProps {
  onBack: () => void;
  waifuData?: WaifuModel | null;
}

export default function MobileChat({ onBack, waifuData }: MobileChatProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isWaifuSpeaking, setIsWaifuSpeaking] = useState(false);
  const [showTipping, setShowTipping] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationQueue = useRef(new AnimationQueue());

  const waifuName = waifuData?.personality.name || 'Luna';
  
  const [messages, setMessages] = useState([
    { type: 'waifu', text: `Hello! I'm ${waifuName}, your AI companion. How are you feeling today?` },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: message }]);
      
      // Analyze message for animation
      const animation = getAnimationFromText(message);
      setCurrentAnimation(animation);
      
      setMessage('');
      
      // Simulate waifu response
      setTimeout(() => {
        const responses = [
          "That's really interesting! I love talking with you =•",
          "Tell me more about that, I'm curious!",
          "You always know how to make me smile! =
",
          "I'm here for you, always! =–",
          "That sounds wonderful! Thanks for sharing with me <8"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Get animation for response
        const responseAnimation = getAnimationFromText(response);
        setCurrentAnimation(responseAnimation);
        setIsWaifuSpeaking(true);
        
        // Simulate lip sync
        simulateLipSync(response, (speaking) => {
          setIsWaifuSpeaking(speaking);
          if (!speaking) {
            setCurrentAnimation('idle');
          }
        });
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'waifu', 
            text: response
          }]);
        }, 500);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white overflow-hidden">
      {/* Top Navigation */}
      <div className="flex justify-between items-center p-4 pt-12">
        <button onClick={onBack} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">{waifuName}</h2>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Capture Button */}
      <div className="absolute top-20 right-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-700/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2"
        >
          <div className="w-4 h-4 border-2 border-white rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 border border-white"></div>
          </div>
          <span className="text-sm">Capture</span>
        </motion.button>
      </div>

      {/* Waifu Display */}
      <div className="flex-1 relative overflow-hidden px-4">
        <div className="h-full flex items-center justify-center py-8">
          <Suspense fallback={
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-72 h-80 bg-gradient-to-b from-pink-400 via-purple-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20"
            >
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">ó</div>
                <h3 className="text-2xl font-bold text-white mb-2">Loading {waifuName}...</h3>
                <p className="text-pink-100">Please wait</p>
              </div>
            </motion.div>
          }>
            <div className="w-full h-full max-w-md">
              <Avatar3D 
                waifuData={waifuData}
                animation={currentAnimation}
                speaking={isWaifuSpeaking}
                className="w-full h-full"
              />
            </div>
          </Suspense>
          
          {/* Status indicator overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-2 bg-black/50 backdrop-blur-sm rounded-full"
            >
              <p className="text-sm text-white">
                {isWaifuSpeaking ? `${waifuName} is speaking...` : "Ready to chat =•"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Chat Messages Overlay */}
        <div className="absolute bottom-32 left-4 right-4">
          <AnimatePresence>
            {messages.slice(-2).map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block max-w-xs px-4 py-2 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 backdrop-blur-sm text-white'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 space-y-4">
        {/* Control Buttons */}
        <div className="flex justify-center space-x-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-purple-700/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6.5C4 4.01 6.01 2 8.5 2S13 4.01 13 6.5 10.99 11 8.5 11 4 8.99 4 6.5zM6 6.5C6 7.88 7.12 9 8.5 9S11 7.88 11 6.5 9.88 4 8.5 4 6 5.12 6 6.5z"/>
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTipping(!showTipping)}
            className="w-12 h-12 bg-purple-700/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <span className="text-xl">=°</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={`w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
              isRecording ? 'bg-red-500' : 'bg-purple-700/50'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-purple-700/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </motion.button>
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Anything..."
                className="w-full p-4 bg-transparent text-white placeholder-white/60 resize-none rounded-2xl focus:outline-none"
                rows={1}
                style={{ maxHeight: '100px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </motion.button>
          </div>

          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 px-4 py-2 rounded-full text-white text-sm"
            >
              <¤ Recording...
            </motion.div>
          )}
        </div>
      </div>

      {/* Tipping Panel Overlay */}
      <AnimatePresence>
        {showTipping && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-sm p-6 rounded-t-3xl"
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Tip {waifuName} =•</h3>
              <p className="text-purple-300">Show your appreciation</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['$1', '$5', '$10', '$25', '$50', '$100'].map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-semibold"
                >
                  {amount}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowTipping(false)}
              className="w-full py-3 bg-gray-600 rounded-xl"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}