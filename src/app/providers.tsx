'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { base } from 'viem/chains';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { wagmiConfig } from '@/lib/wagmi-config';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}