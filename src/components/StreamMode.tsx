'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamMessage {
  id: string;
  type: 'chat' | 'tip';
  user: {
    username?: string;
  };
  content: string;
  timestamp: number;
}

interface StreamModeProps {
  onBack: () => void;
}

export default function StreamMode({ onBack }: StreamModeProps) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaifuSpeaking, setIsWaifuSpeaking] = useState(false);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTipAction, setSelectedTipAction] = useState<{amount: number; action: string; price: string} | null>(null);
  const [currentVideo, setCurrentVideo] = useState('/videos/waifu-01.mp4');

  const addMessage = (message: StreamMessage) => {
    setMessages(prev => [...prev.slice(-10), message]); // Keep last 10 messages max
  };

  const handleWaifuResponse = async (userMessage: string) => {
    if (isTyping) return;
    
    console.log('🤖 Getting waifu response for:', userMessage);
    setIsTyping(true);
    
    try {
      // Convert messages to OpenAI format for context
      const messageHistory = messages.map(msg => ({
        role: msg.user.username === 'Zoe' ? 'assistant' : 'user',
        content: msg.user.username === 'Zoe' ? msg.content : `${msg.user.username}: ${msg.content}`
      }));
      
      console.log('📡 Calling OpenRouter API...');
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          type: 'chat',
          username: 'lausuarez02',
          history: messageHistory
        })
      });
      
      const data = await response.json();
      console.log('🎯 OpenRouter response:', data);
      
      if (data.success) {
        console.log('🎵 Generating audio with ElevenLabs...');
        const audioResponse = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text })
        });
        
        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('🔊 Audio generated, playing...');
          
          // Add Zoe's response
          const waifuMessage: StreamMessage = {
            id: Date.now().toString(),
            type: 'chat',
            user: { username: 'Zoe' },
            content: data.text,
            timestamp: Date.now()
          };
          
          addMessage(waifuMessage);
          
          // Play audio
          const audio = new Audio(audioUrl);
          setIsWaifuSpeaking(true);
          
          audio.onended = () => {
            setIsWaifuSpeaking(false);
          };
          
          audio.play();
        } else {
          console.error('❌ Audio generation failed');
        }
      } else {
        console.error('❌ OpenRouter failed');
      }
    } catch (error) {
      console.error('💥 Error getting waifu response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = () => {
    console.log('🚀 Sending message:', newMessage);
    if (!newMessage.trim()) return;

    const message: StreamMessage = {
      id: Date.now().toString(),
      type: 'chat',
      user: { username: 'lausuarez02' },
      content: newMessage,
      timestamp: Date.now()
    };

    // Add your message
    addMessage(message);
    
    // Trigger AI response
    handleWaifuResponse(newMessage);
    
    setNewMessage('');
  };

  const handleTip = (amount: number) => {
    console.log('💰 Processing tip:', amount);
    
    const tipMessage: StreamMessage = {
      id: Date.now().toString(),
      type: 'tip',
      user: { username: 'lausuarez02' },
      content: `sent a ${selectedTipAction?.action || 'tip'}`,
      timestamp: Date.now()
    };

    addMessage(tipMessage);
    
    // Switch to special tip video
    setCurrentVideo('/videos/waifu-00.mp4');
    
    // Trigger money animation
    setShowMoneyAnimation(true);
    setTimeout(() => {
      setShowMoneyAnimation(false);
      // Switch back to random video after tip animation
      const regularVideos = ['/videos/waifu-01.mp4', '/videos/waifu-03.mp4', '/videos/waifu-04.mp4'];
      setCurrentVideo(regularVideos[Math.floor(Math.random() * regularVideos.length)]);
    }, 3000);
    
    // Zoe thanks for tip
    handleWaifuResponse(`Thank you so much for making me ${selectedTipAction?.action}! You're amazing! 💖`);
  };

  // Get only last 2 messages for display
  const visibleMessages = messages.slice(-2);

  useEffect(() => {
    if (selectedTipAction) {
      setShowPaymentModal(true);
    }
  }, [selectedTipAction]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* Fullscreen Video Background */}
      <video
        key={currentVideo}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={currentVideo}
      />

      {/* Top UI */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="flex items-center px-3 py-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm"
        >
          <span className="text-white text-lg">←</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20 bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
        <span className="text-white text-sm">🔴 LIVE</span>
      </div>

      {/* Waifu Name */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
        <h2 className="text-white text-2xl font-bold">Zoe</h2>
      </div>

      {/* Money Animation */}
      {showMoneyAnimation && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -50, 
                x: Math.random() * window.innerWidth,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: window.innerHeight + 50,
                opacity: 0,
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 0.5,
                ease: "easeIn"
              }}
              className="absolute text-3xl"
            >
              💰
            </motion.div>
          ))}
        </div>
      )}

      {/* Chat Messages Overlay - Last 2 messages */}
      <div className="absolute bottom-48 left-4 right-4 z-20 space-y-2">
        {visibleMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-xl backdrop-blur-md max-w-xs ${
              message.type === 'tip' 
                ? 'bg-yellow-500/40 border border-yellow-400/60'
                : message.user.username === 'Zoe'
                ? 'bg-pink-500/40 border border-pink-400/60'
                : 'bg-white/20 border border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-white">
                {message.user.username}
              </span>
            </div>
            <p className="text-sm text-white">
              {message.type === 'tip' && (
                <span className="text-yellow-300">💰 </span>
              )}
              {message.content}
            </p>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-xl bg-pink-500/40 border border-pink-400/60 backdrop-blur-md max-w-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-white">Zoe</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Tip Action Buttons */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        <button 
          onClick={() => setSelectedTipAction({amount: 0.001, action: "Send a kiss", price: "$3"})}
          className="px-4 py-2 bg-pink-500/80 hover:bg-pink-600/80 rounded-full backdrop-blur-sm text-white text-sm font-semibold"
        >
          💋 Send a kiss
        </button>
        <button 
          onClick={() => setSelectedTipAction({amount: 0.005, action: "Make her dance", price: "$15"})}
          className="px-4 py-2 bg-purple-500/80 hover:bg-purple-600/80 rounded-full backdrop-blur-sm text-white text-sm font-semibold"
        >
          💃 Make her dance
        </button>
        <button 
          onClick={() => setSelectedTipAction({amount: 0.01, action: "Special show", price: "$30"})}
          className="px-4 py-2 bg-red-500/80 hover:bg-red-600/80 rounded-full backdrop-blur-sm text-white text-sm font-semibold"
        >
          🔥 Special show
        </button>
      </div>

      {/* Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
            L
          </div>
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-full text-white font-semibold shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>


      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedTipAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-b from-purple-900/95 to-pink-900/95 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30 backdrop-blur-md"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-2xl font-bold mb-2 text-white">{selectedTipAction.action}</h3>
                <p className="text-purple-200 mb-6">Make Zoe do something special just for you!</p>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-white">{selectedTipAction.price}</div>
                    <div className="text-purple-300 text-sm">One-time payment</div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleTip(selectedTipAction.amount);
                        setShowPaymentModal(false);
                        setSelectedTipAction(null);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white"
                    >
                      💳 Pay with Crypto
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleTip(selectedTipAction.amount);
                        setShowPaymentModal(false);
                        setSelectedTipAction(null);
                      }}
                      className="w-full py-3 bg-blue-600 rounded-xl font-semibold text-white"
                    >
                      💳 PayPal
                    </motion.button>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedTipAction(null);
                  }}
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