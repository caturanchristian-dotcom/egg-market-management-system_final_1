import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

/**
 * AuthContext Interface
 * Defines the shape of the global authentication state and methods
 */
interface AuthContextType {
  user: User | null;         // The currently authenticated user object (includes role, name, etc.)
  login: (user: User) => void; // Function to manually set user state after successful sign-in
  logout: () => void;        // Function to clear session locally and on the server
  updateUser: (user: User) => void; // Function to sync profile changes into global state
  refreshUser: () => Promise<void>; // Function to re-fetch the current user from /api/auth/me
  loading: boolean;          // True while the initial session verification is in progress
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Wraps the application to provide a persistent authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Internal method to check if the user has an active session on the server
   * Also utilizes localStorage as a fast fallback/backup
   */
  const verifySession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        // Server confirms active session
        const userData = await response.json();
        setUser(userData);
        try {
          localStorage.setItem('eggmarket_user', JSON.stringify(userData));
        } catch (e) {
          console.error('Failed to save user to localStorage:', e);
        }
      } else {
        // Server says no session; check if we can restore from local storage as a guest/stale session
        const savedUser = localStorage.getItem('eggmarket_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
            localStorage.removeItem('eggmarket_user');
          }
        }
      }
    } catch (err) {
      // Network error: Fallback to local storage
      console.error('Session verification failed:', err);
      const savedUser = localStorage.getItem('eggmarket_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('eggmarket_user');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Run session verification once on application startup
   */
  useEffect(() => {
    verifySession();
  }, []);

  /**
   * Public method to force a session refresh (e.g., after OAuth success)
   */
  const refreshUser = async () => {
    await verifySession();
  };

  /**
   * Persists user to state and local storage after successful login
   */
  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('eggmarket_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  };

  /**
   * Clears session from both server (via logout route) and client
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    localStorage.removeItem('eggmarket_user');
  };

  /**
   * Updates user data in both state and local storage
   */
  const updateUser = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem('eggmarket_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Custom Hook
 * Provides easy access to authentication state and methods within functional components
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
