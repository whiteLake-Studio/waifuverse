'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationFromText, simulateLipSync, AnimationQueue } from '@/utils/animationController';
import { WaifuModel } from '@/types/waifu';
import WaifuVideo, { waifuVideoControls } from '@/components/WaifuVideo';

interface MobileChatProps {
  onBack: () => void;
  waifuData?: WaifuModel | null;
}

export default function MobileChat({ onBack, waifuData }: MobileChatProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isWaifuSpeaking, setIsWaifuSpeaking] = useState(false);
  const [showTipping, setShowTipping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animationQueue = useRef(new AnimationQueue());

  const waifuName = waifuData?.personality.name || 'Luna';
  
  const [messages, setMessages] = useState([
    { type: 'waifu', text: `Hello! I'm ${waifuName}, your AI companion. How are you feeling today?` },
  ]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: message }]);
      
      // Analyze message for animation
      const animation = getAnimationFromText(message);
      setCurrentAnimation(animation);
      
      const userMessage = message;
      setMessage('');
      
      try {
        // Get AI response from OpenRouter
        const chatResponse = await fetch('/api/socket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage,
            type: 'chat'
          })
        });
        
        const chatData = await chatResponse.json();
        const responseText = chatData.text;
        
        // Get animation for response
        const responseAnimation = getAnimationFromText(responseText);
        setCurrentAnimation(responseAnimation);
        setIsWaifuSpeaking(true);
        
        // Play a random video when waifu responds
        waifuVideoControls.playRandomVideo();
        
        // Generate voice with ElevenLabs
        const voiceResponse = await fetch('/api/voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: responseText })
        });
        
        if (voiceResponse.ok) {
          const audioBlob = await voiceResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            setIsWaifuSpeaking(false);
            setCurrentAnimation('idle');
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.play();
        } else {
          // Fallback to lip sync simulation if voice fails
          simulateLipSync(responseText, (speaking) => {
            setIsWaifuSpeaking(speaking);
            if (!speaking) {
              setCurrentAnimation('idle');
            }
          });
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'waifu', 
            text: responseText
          }]);
        }, 500);
        
      } catch (error) {
        console.error('Chat error:', error);
        const fallbackResponse = "Sorry, I had a little hiccup! Can you try again? 😅";
        
        // Fallback response
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            type: 'waifu', 
            text: fallbackResponse
          }]);
          setIsWaifuSpeaking(false);
          setCurrentAnimation('idle');
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 text-white overflow-hidden">
      {/* Full Background Video */}
      <div className="absolute inset-0">
        <WaifuVideo 
          className="w-full h-full"
          onVideoEnd={() => {
            // Optional: Do something when video ends
          }}
        />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-4 pt-12 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onBack} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">{waifuName}</h2>
          <div className="w-6"></div> {/* Spacer */}
        </div>

        {/* Capture Button */}
        <div className="absolute top-20 right-4">
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

        {/* Spacer to push content down */}
        <div className="flex-1"></div>

        {/* Chat Messages */}
        <div className="px-4 pb-4">
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

        {/* Quick Action Suggestions */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMessage("How are you feeling today?")}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 border border-white/20"
            >
              💭 Ask how she feels
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMessage("Tell me something interesting")}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 border border-white/20"
            >
              ✨ Something interesting
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMessage("What are you thinking about?")}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 border border-white/20"
            >
              🤔 What's on your mind
            </motion.button>
          </div>
        </div>

        {/* Main Chat Input */}
        <div className="px-4 pb-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isWaifuSpeaking ? `${waifuName} is speaking...` : "Type your message..."}
                disabled={isWaifuSpeaking}
                className="w-full px-4 py-3 bg-transparent text-white placeholder-white/70 resize-none rounded-2xl focus:outline-none min-h-[48px]"
                rows={1}
                style={{ maxHeight: '120px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim() || isWaifuSpeaking}
              className="bg-gradient-to-r from-pink-500 to-purple-600 w-12 h-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Secondary Actions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {/* Voice Recording Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => setIsRecording(true)}
          onMouseUp={() => setIsRecording(false)}
          onTouchStart={() => setIsRecording(true)}
          onTouchEnd={() => setIsRecording(false)}
          className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
            isRecording ? 'bg-red-500' : 'bg-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
            <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTipping(!showTipping)}
          className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <span className="text-sm">💎</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPayment(true)}
          className="w-10 h-10 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-400/30"
        >
          <span className="text-sm">🔒</span>
        </motion.button>

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 px-4 py-2 rounded-full text-white text-sm"
          >
            🔴 Recording...
          </motion.div>
        )}
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
              <h3 className="text-xl font-bold">Tip {waifuName} 💎</h3>
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

      {/* Payment Modal for Private Chat */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-b from-purple-900/90 to-pink-900/90 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-2">Go Private</h3>
                <p className="text-purple-200 mb-6">Unlock exclusive private chat with {waifuName}</p>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-white">$4.99</div>
                    <div className="text-purple-300 text-sm">One-time unlock</div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold"
                    >
                      💳 Pay with Card
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-blue-600 rounded-xl font-semibold"
                    >
                      💳 PayPal
                    </motion.button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPayment(false)}
                  className="mt-4 text-gray-400 text-sm"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}