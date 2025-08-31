'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFarcasterSession, type FarcasterUser } from '@/hooks/useFarcasterSession';

interface AuthContextType {
  user: FarcasterUser | null;
  verifiedUser: FarcasterUser | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  fid?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, clearSession } = useFarcasterSession();

  const login = async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      
      // Initialize SDK
      await sdk.actions.ready();
      
      // Get authentication token
      const { token } = await sdk.quickAuth.getToken();
      
      if (!token) {
        throw new Error('No token received from Farcaster');
      }

      // Send token to our validation endpoint
      const authResponse = await fetch('/api/auth/farcaster-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const authData = await authResponse.json();
      
      // Store session
      if (typeof window !== 'undefined') {
        localStorage.setItem('farcaster-session', JSON.stringify(authData.user));
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    clearSession();
  };

  const authValue: AuthContextType = {
    user: user,
    verifiedUser: user,
    isAuthenticated: !!user,
    login,
    logout,
    status: loading ? 'loading' : (user ? 'authenticated' : 'unauthenticated'),
    fid: user?.fid,
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
    // Return mock data if context is not available (for development)
    return {
      user: null,
      verifiedUser: null,
      isAuthenticated: false,
      login: async () => {
        console.log('Mock login from fallback');
      },
      logout: async () => {},
      status: 'unauthenticated' as const,
      fid: undefined,
    };
  }
  return context;
}