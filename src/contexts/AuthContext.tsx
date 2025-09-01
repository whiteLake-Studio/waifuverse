'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = address ? {
    id: address,
    walletAddress: address,
    username: `${address.slice(0, 6)}...${address.slice(-4)}`,
  } : null;

  const login = async () => {
    try {
      const connector = connectors[0];
      if (connector) {
        await connectAsync({ connector });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    disconnect();
  };

  if (!mounted) {
    const authValue: AuthContextType = {
      user: null,
      isAuthenticated: false,
      login,
      logout,
      status: 'loading',
      address: undefined,
    };

    return (
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  const authValue: AuthContextType = {
    user,
    isAuthenticated: isConnected,
    login,
    logout,
    status: isConnecting ? 'loading' : (isConnected ? 'authenticated' : 'unauthenticated'),
    address,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      login: async () => {
        console.log('Mock login from fallback');
      },
      logout: async () => {},
      status: 'unauthenticated' as const,
      address: undefined,
    };
  }
  return context;
}