'use client';

import { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import MobileChat from '@/components/MobileChat';
import CustomWaifuCreator from '@/components/CustomWaifuCreator';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Wallet, WalletDropdown } from '@coinbase/onchainkit/wallet';
import { WaifuModel } from '@/types/waifu';
import { motion, AnimatePresence } from 'framer-motion';

type Screen = 'menu' | 'create' | 'private' | 'stream';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [customWaifu, setCustomWaifu] = useState<WaifuModel | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaidForPrivate, setHasPaidForPrivate] = useState(false);

  const handleNavigate = (screen: Screen) => {
    if (screen === 'private' && !hasPaidForPrivate) {
      setShowPaymentModal(true);
      return;
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('menu');
  };

  const handleWaifuCreated = (waifu: WaifuModel) => {
    setCustomWaifu(waifu);
    // Go to stream/chat after waifu creation
    setCurrentScreen('stream');
  };

  // Mobile-first design
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hidden wallet connection for functionality */}
      <div className="hidden">
        <Wallet>
          <ConnectWallet />
          <WalletDropdown />
        </Wallet>
      </div>

      {currentScreen === 'menu' && (
        <MainMenu onNavigate={handleNavigate} />
      )}

      {currentScreen === 'stream' && (
        <MobileChat 
          onBack={handleBack} 
          waifuData={customWaifu}
        />
      )}

      {currentScreen === 'private' && hasPaidForPrivate && (
        <MobileChat 
          onBack={handleBack} 
          waifuData={customWaifu}
        />
      )}

      {currentScreen === 'create' && (
        <CustomWaifuCreator 
          onComplete={handleWaifuCreated}
          onBack={handleBack}
        />
      )}

      {/* Payment Modal for Private Chat */}
      <AnimatePresence>
        {showPaymentModal && (
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
              className="bg-gradient-to-b from-purple-900/90 to-pink-900/90 rounded-2xl p-6 max-w-sm w-full border border-purple-500/30"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-2">Unlock Private Chat</h3>
                <p className="text-purple-200 mb-6">Get exclusive access to private conversations</p>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-white">$4.99</div>
                    <div className="text-purple-300 text-sm">One-time unlock</div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setHasPaidForPrivate(true);
                        setShowPaymentModal(false);
                        setCurrentScreen('private');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold"
                    >
                      💳 Pay with Card
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setHasPaidForPrivate(true);
                        setShowPaymentModal(false);
                        setCurrentScreen('private');
                      }}
                      className="w-full py-3 bg-blue-600 rounded-xl font-semibold"
                    >
                      💳 PayPal
                    </motion.button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPaymentModal(false)}
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