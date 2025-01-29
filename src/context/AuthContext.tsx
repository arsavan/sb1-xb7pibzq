import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  adminLogin: (user: User) => void;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserType(session.user);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUserType(session.user);
      } else {
        // Clear all auth state
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserType = async (user: User) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role === 'admin') {
        // Admin user
        setIsAdmin(true);
        setIsAuthenticated(false);
        setUser(user);
      } else {
        // Regular user
        setIsAdmin(false);
        setIsAuthenticated(true);
        setUser(user);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Clear auth state on error
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    }
  };

  const login = () => setIsAuthenticated(true);
  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const adminLogin = (user: User) => {
    setIsAdmin(true);
    setUser(user);
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      login, 
      logout,
      adminLogin,
      adminLogout
    }}>
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