'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSendTransaction, useAccount, useConnect, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

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
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendTransaction, data: txHash } = useSendTransaction();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaifuSpeaking, setIsWaifuSpeaking] = useState(false);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
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
          username: user?.username || 'Anonymous',
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
      user: { username: user?.username || 'Anonymous' },
      content: newMessage,
      timestamp: Date.now()
    };

    // Add your message
    addMessage(message);
    
    // Trigger AI response
    handleWaifuResponse(newMessage);
    
    setNewMessage('');
  };

  const handleTip = async (amount: number) => {
    console.log('💰 Processing tip:', amount);
    console.log('🔗 Wallet connected:', isConnected, 'Address:', address);
    
    // If wallet not connected, connect first
    if (!isConnected) {
      console.log('🔌 Connecting wallet...');
      const farcasterConnector = connectors.find(c => c.name.includes('farcaster') || c.name.includes('Farcaster'));
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
        return;
      } else {
        console.error('❌ Farcaster connector not found');
        return;
      }
    }
    
    try {
      // Send direct ETH transaction to tip contract using wagmi
      console.log('💳 Sending', amount, 'ETH to contract...');
      sendTransaction({
        to: '0x91880073Ab94B587D721C939355f8D25a74D39dE', // Your deployed TipReceiver contract
        value: parseEther(amount.toString()), // Convert amount to wei
      });
      
      console.log('💳 Tip transaction initiated for', amount, 'ETH');
      
      // Transaction initiated - confirmation will be handled by useEffect
      
    } catch (error) {
      console.error('💥 Tip transaction failed:', error);
      // Still show animation even if transaction fails
      const tipMessage: StreamMessage = {
        id: Date.now().toString(),
        type: 'tip',
        user: { username: user?.username || 'Anonymous' },
        content: `tried to send a ${selectedTipAction?.action || 'tip'}`,
        timestamp: Date.now()
      };
      addMessage(tipMessage);
    }
  };

  // Get only last 2 messages for display
  const visibleMessages = messages.slice(-2);

  // Watch for transaction confirmation
  useEffect(() => {
    if (txConfirmed && txHash) {
      console.log('✅ Transaction confirmed!', txHash);
      
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
      
      // Zoe thanks for tip with user's real name
      handleWaifuResponse(`${user?.username || 'Someone'} just tipped me! Thank you so much! 💖`);
    }
  }, [txConfirmed, txHash, user?.username]);


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
      <div className="absolute bottom-20 left-4 right-4 z-20 flex gap-2 justify-center">
        <button 
          onClick={() => handleTip(0.000001)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-pink-500/70 hover:bg-pink-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          💋 Kiss
        </button>
        <button 
          onClick={() => handleTip(0.000005)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-purple-500/70 hover:bg-purple-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          💃 Dance
        </button>
        <button 
          onClick={() => handleTip(0.00001)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-red-500/70 hover:bg-red-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          🔥 Show
        </button>
      </div>

      {/* Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
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


    </div>
  );
}