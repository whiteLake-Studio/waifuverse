'use client';

import { useState } from 'react';
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction';
import { useAccount } from '@coinbase/onchainkit/wallet';

interface TipData {
  amount: string;
  currency: 'ETH' | 'USDC';
  message?: string;
}

const tipAmounts = [
  { amount: '0.001', currency: 'ETH' as const, label: '$3' },
  { amount: '0.005', currency: 'ETH' as const, label: '$15' },
  { amount: '0.01', currency: 'ETH' as const, label: '$30' },
  { amount: '5', currency: 'USDC' as const, label: '$5' },
  { amount: '10', currency: 'USDC' as const, label: '$10' },
  { amount: '25', currency: 'USDC' as const, label: '$25' },
];

interface Tipper {
  address: string;
  amount: number;
  currency: string;
  message?: string;
  timestamp: Date;
}

export default function TippingPanel() {
  const { address } = useAccount();
  const [selectedTip, setSelectedTip] = useState<TipData | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [goal, setGoal] = useState({ current: 127, target: 500 });
  const [topTippers] = useState<Tipper[]>([
    { address: '0x123...abc', amount: 25, currency: 'USDC', message: 'Love your voice!', timestamp: new Date() },
    { address: '0x456...def', amount: 0.01, currency: 'ETH', timestamp: new Date() },
    { address: '0x789...ghi', amount: 15, currency: 'USDC', message: 'So cute! 💖', timestamp: new Date() },
  ]);

  const handleTip = (tip: TipData) => {
    setSelectedTip(tip);
    if (tip.message) {
      setTipMessage(tip.message);
    }
  };

  const handleCustomTip = () => {
    if (customAmount) {
      setSelectedTip({
        amount: customAmount,
        currency: 'ETH',
        message: tipMessage
      });
    }
  };

  const progressPercentage = (goal.current / goal.target) * 100;

  return (
    <div className="bg-black/20 rounded-lg backdrop-blur-sm border border-white/10 p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Support Your Waifu 💖</h3>
        
        <div className="mb-4">
          <div className="bg-white/10 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-white/60 mt-1">
            ${goal.current} / ${goal.target} goal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tipAmounts.map((tip) => (
          <button
            key={`${tip.amount}-${tip.currency}`}
            onClick={() => handleTip(tip)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition-all"
          >
            {tip.label}
            <div className="text-xs opacity-80">{tip.amount} {tip.currency}</div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Custom Amount
        </button>

        {showCustom && (
          <div className="space-y-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount (ETH)"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
              step="0.001"
            />
          </div>
        )}

        <input
          type="text"
          value={tipMessage}
          onChange={(e) => setTipMessage(e.target.value)}
          placeholder="Optional message..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
          maxLength={100}
        />

        {address && selectedTip && (
          <Transaction
            calls={[
              {
                to: '0x1234567890123456789012345678901234567890', // Replace with actual contract
                data: '0x',
                value: BigInt(parseFloat(selectedTip.amount) * 1e18)
              }
            ]}
          >
            <TransactionButton
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              text={`Send Tip (${selectedTip.amount} ${selectedTip.currency})`}
            />
          </Transaction>
        )}

        {!address && (
          <p className="text-center text-sm text-white/60">
            Connect wallet to send tips
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-semibold text-white mb-2">Recent Tips 🏆</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {topTippers.map((tipper, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div>
                <span className="text-white/80">
                  {tipper.address.slice(0, 6)}...{tipper.address.slice(-4)}
                </span>
                {tipper.message && (
                  <div className="text-white/60 mt-1">{tipper.message}</div>
                )}
              </div>
              <div className="text-pink-400 font-semibold">
                {tipper.amount} {tipper.currency}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}