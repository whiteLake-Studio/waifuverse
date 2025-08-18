'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Wallet, WalletDropdown } from '@coinbase/onchainkit/wallet';
import ChatInterface from '@/components/ChatInterface';
import AvatarRenderer from '@/components/AvatarRenderer';
import TippingPanel from '@/components/TippingPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-white">WaifuVerse</h1>
        <Wallet>
          <ConnectWallet />
          <WalletDropdown />
        </Wallet>
      </header>
      
      <main className="flex h-[calc(100vh-80px)] gap-4 p-4">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10 mb-4">
            <AvatarRenderer />
          </div>
          <TippingPanel />
        </div>
        
        <div className="flex-1">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
