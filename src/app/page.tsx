'use client';

import { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import MobileChat from '@/components/MobileChat';
import CustomWaifuCreator from '@/components/CustomWaifuCreator';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Wallet, WalletDropdown } from '@coinbase/onchainkit/wallet';
import { WaifuModel } from '@/types/waifu';

type Screen = 'menu' | 'create' | 'private' | 'stream';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [customWaifu, setCustomWaifu] = useState<WaifuModel | null>(null);

  const handleNavigate = (screen: Screen) => {
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

      {(currentScreen === 'stream' || currentScreen === 'private') && (
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
    </div>
  );
}