'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  mobileNumber: string;
  userType: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      }
    }
    // If no access token but we might have a refresh token cookie, try to refresh silently
    if (!token) {
      (async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              if (userData) {
                try {
                  setUser(JSON.parse(userData));
                } catch {}
              }
            }
          }
        } catch {}
        setIsLoading(false);
      })();
      return;
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}