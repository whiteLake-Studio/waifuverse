'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface TipData {
  amount: string;
  currency: 'DUCK';
  message?: string;
}

const tipAmounts = [
  { amount: '0.1', currency: 'DUCK' as const, label: '0.1 DUCK' },
  { amount: '0.5', currency: 'DUCK' as const, label: '0.5 DUCK' },
  { amount: '1', currency: 'DUCK' as const, label: '1 DUCK' },
  { amount: '2', currency: 'DUCK' as const, label: '2 DUCK' },
  { amount: '5', currency: 'DUCK' as const, label: '5 DUCK' },
  { amount: '10', currency: 'DUCK' as const, label: '10 DUCK' },
];

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
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
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

interface Tipper {
  address: string;
  amount: number;
  currency: string;
  message?: string;
  timestamp: Date;
}

export default function TippingPanel() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [needsApproval, setNeedsApproval] = useState(false);
  
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
        currency: 'DUCK',
        message: tipMessage
      });
    }
  };

  const approveDuck = async () => {
    if (!selectedTip) return;
    
    try {
      const amount = parseEther(selectedTip.amount);
      await writeContract({
        address: DUCK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TIP_CONTRACT_ADDRESS, amount],
      });
      setNeedsApproval(false);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const sendTip = async () => {
    if (!selectedTip || !address) return;
    
    try {
      const amount = parseEther(selectedTip.amount);
      
      if (tipMessage) {
        await writeContract({
          address: TIP_CONTRACT_ADDRESS,
          abi: TIP_CONTRACT_ABI,
          functionName: 'tipERC20',
          args: [DUCK_TOKEN_ADDRESS, amount, tipMessage],
        });
      } else {
        await writeContract({
          address: TIP_CONTRACT_ADDRESS,
          abi: TIP_CONTRACT_ABI,
          functionName: 'tipERC20',
          args: [DUCK_TOKEN_ADDRESS, amount],
        });
      }
    } catch (error) {
      console.error('Tip failed:', error);
      if (error instanceof Error && error.message?.includes('insufficient allowance')) {
        setNeedsApproval(true);
      }
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
              placeholder="Enter amount (DUCK)"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
              step="0.001"
            />
            <button
              onClick={handleCustomTip}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Set Custom Amount
            </button>
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

        {address && selectedTip && needsApproval && (
          <button
            onClick={approveDuck}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : `Approve ${selectedTip.amount} DUCK`}
          </button>
        )}

        {address && selectedTip && !needsApproval && (
          <button
            onClick={sendTip}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : `Send Tip (${selectedTip.amount} ${selectedTip.currency})`}
          </button>
        )}
        
        {isConfirmed && (
          <div className="text-green-400 text-sm text-center">
            Tip sent successfully! 🎉
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm text-center">
            Error: {error.message}
          </div>
        )}

        {!address && (
          <p className="text-center text-sm text-white/60">
            Connect wallet to send tips on DuckChain
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