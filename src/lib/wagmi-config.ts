import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const duckChain = defineChain({
  id: 5545,
  name: 'DuckChain',
  nativeCurrency: {
    decimals: 18,
    name: 'DUCK',
    symbol: 'DUCK',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.duckchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DuckChain Explorer',
      url: 'https://explorer.duckchain.io',
    },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: 'WaifuVerse',
  projectId: 'your-project-id', // Replace with your WalletConnect project ID
  chains: [duckChain],
  transports: {
    [duckChain.id]: http(),
  },
});