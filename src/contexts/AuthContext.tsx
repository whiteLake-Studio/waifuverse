'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  verifiedUser: any;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  fid?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const login = async () => {
    // Mock login for testing - simulates successful Farcaster auth
    const mockUser = { 
      fid: Math.random().toString().slice(2, 8), 
      username: `User${Math.random().toString().slice(2, 6)}` 
    };
    setUser(mockUser);
    console.log('Mock login successful:', mockUser);
  };

  const logout = async () => {
    setUser(null);
  };

  const authValue: AuthContextType = {
    user: user,
    verifiedUser: user,
    isAuthenticated: !!user,
    login,
    logout,
    status: user ? 'authenticated' : 'unauthenticated',
    fid: user?.fid,
  };

  if (!isReady) {
    return <>{children}</>;
  }

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