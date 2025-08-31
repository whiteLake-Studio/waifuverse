'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function AuthButton() {
  const { user, login, logout, status, fid } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <button className="px-6 py-2 bg-gray-600 text-white rounded-lg opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="text-gray-300">
            {user.username || `User ${fid}`}
          </p>
          {fid && (
            <p className="text-xs text-gray-500">FID: {fid}</p>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
    >
      Sign In with Farcaster
    </button>
  );
}