'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const DUCK_TOKEN_ADDRESS = '0xdA65892eA771d3268610337E9964D916028B7dAD';
const TIP_CONTRACT_ADDRESS = '0x49fba895d0184512f6c12933F90BD91deD27c7FC';

const ERC20_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const TIP_CONTRACT_ABI = [
  {
    inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'note', type: 'string' }],
    name: 'tipERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'tipERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

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
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaifuSpeaking, setIsWaifuSpeaking] = useState(false);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
  const [selectedTipAction, setSelectedTipAction] = useState<{amount: number; action: string; price: string} | null>(null);
  const [currentVideo, setCurrentVideo] = useState('/videos/waifu-01.mp4');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [pendingTipAmount, setPendingTipAmount] = useState<number | null>(null);

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

  // Handle both approve and send in one function
  const handleApproveAndSend = async (amount: number) => {
    if (!isConnected) return;
    
    try {
      const tipAmount = parseEther(amount.toString());
      
      // Step 1: Approve DUCK tokens
      console.log('💰 Approving', amount, 'DUCK tokens...');
      await writeContract({
        address: DUCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TIP_CONTRACT_ADDRESS, tipAmount],
      });
      
      // Wait a bit for approval to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Send the tip
      console.log('💳 Sending', amount, 'DUCK to tip contract...');
      await writeContract({
        address: TIP_CONTRACT_ADDRESS,
        abi: TIP_CONTRACT_ABI,
        functionName: 'tipERC20',
        args: [DUCK_TOKEN_ADDRESS, tipAmount, `Stream tip: ${selectedTipAction?.action || 'tip'}`],
      });
      
      console.log('✅ Tip sent successfully!');
      
      // Close modal after success
      setNeedsApproval(false);
      setPendingTipAmount(null);
      
    } catch (error) {
      console.error('💥 Transaction failed:', error);
      // Keep modal open on error so user can retry
    }
  };

  const handleTip = async (amount: number) => {
    console.log('💰 Processing tip:', amount);
    console.log('🔗 Wallet connected:', isConnected, 'Address:', address);
    
    // If wallet not connected, connect first
    if (!isConnected) {
      console.log('🔌 Connecting wallet...');
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
        return;
      } else {
        console.error('❌ No wallet connector found');
        return;
      }
    }
    
    // Show approval modal
    setNeedsApproval(true);
    setPendingTipAmount(amount);
  };

  // Get only last 2 messages for display
  const visibleMessages = messages.slice(-2);

  // Watch for transaction confirmation
  useEffect(() => {
    if (txConfirmed && hash) {
      console.log('✅ Transaction confirmed!', hash);
      
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
  }, [txConfirmed, hash, user?.username]);


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

      {/* Approval Modal */}
      {needsApproval && pendingTipAmount && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="bg-purple-900/90 rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Send {pendingTipAmount} DUCK Tip</h3>
            <p className="text-purple-200 text-sm mb-6 text-center">
              Click to approve and send your tip
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleApproveAndSend(pendingTipAmount)}
                disabled={isPending}
                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-pink-600 hover:from-yellow-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg font-semibold"
              >
                {isPending ? 'Processing...' : 'Approve & Send Tip'}
              </button>
              <button
                onClick={() => {
                  setNeedsApproval(false);
                  setPendingTipAmount(null);
                }}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tip Action Buttons */}
      <div className="absolute bottom-20 left-4 right-4 z-20 flex gap-2 justify-center">
        <button 
          onClick={() => handleTip(1)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-pink-500/70 hover:bg-pink-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          💋 Kiss (1 DUCK)
        </button>
        <button 
          onClick={() => handleTip(5)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-purple-500/70 hover:bg-purple-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          💃 Dance (5 DUCK)
        </button>
        <button 
          onClick={() => handleTip(10)}
          className="flex-1 max-w-[150px] px-3 py-1.5 bg-red-500/70 hover:bg-red-600/80 rounded-full backdrop-blur-sm text-white text-xs font-semibold"
        >
          🔥 Show (10 DUCK)
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