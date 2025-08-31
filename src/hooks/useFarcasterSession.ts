import { useState, useEffect } from 'react';

export interface FarcasterUser {
  id: string;
  walletAddress?: string;
  username: string;
  profilePictureUrl: string;
  fid?: number;
  inviteCode?: string;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (typeof window !== 'undefined') {
    const localSession = localStorage.getItem('farcaster-session');
    if (localSession) {
      headers['X-Local-Session'] = localSession;
    }
  }
  
  return headers;
}

export function useFarcasterSession() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        let localUser: FarcasterUser | null = null;
        if (typeof window !== 'undefined') {
          const localSession = localStorage.getItem('farcaster-session');
          if (localSession) {
            try {
              localUser = JSON.parse(localSession);
              console.log('Found user in localStorage:', localUser);
              
              if (localUser && localUser.walletAddress && localUser.walletAddress.startsWith('0x00000000000000000000000000000000')) {
                console.log('Found old fake wallet address, clearing localStorage');
                localStorage.removeItem('farcaster-session');
                localUser = null;
              }
              
              if (localUser && localUser.id) {
                setUser(localUser);
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing localStorage session:', error);
              localStorage.removeItem('farcaster-session');
            }
          }
        }

        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const data = await response.json();
            console.log('Server session found:', data.user);
            setUser(data.user);
            
            if (typeof window !== 'undefined' && data.user) {
              localStorage.setItem('farcaster-session', JSON.stringify(data.user));
            }
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking server session:', error);
        }

        console.log('No session found in localStorage or server');
        setUser(null);
        setLoading(false);
        
      } catch (error) {
        console.error('Error in session check:', error);
        setUser(null);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const clearSession = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farcaster-session');
    }
  };

  return { user, loading, clearSession };
}