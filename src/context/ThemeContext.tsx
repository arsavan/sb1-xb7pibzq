import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeSettings {
  site_title: string;
  primary_color: string;
  primary_hover_color: string;
  secondary_color: string;
  accent_color: string;
  site_url: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  isLoading: boolean;
}

const defaultSettings: ThemeSettings = {
  site_title: 'CraqueTonBudget',
  primary_color: '#6366f1',
  primary_hover_color: '#4f46e5',
  secondary_color: '#ec4899',
  accent_color: '#8b5cf6',
  site_url: 'https://craquetabudget.com'
};

export const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  isLoading: true
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Apply default theme immediately on mount
  useEffect(() => {
    applyTheme(defaultSettings);
  }, []);

  useEffect(() => {
    fetchSettings();
    
    const channel = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'theme_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      applyTheme(settings);
    }
  }, [settings, isLoading]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      // Keep using default settings on error
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }

  function applyTheme(theme: ThemeSettings) {
    // Apply theme synchronously to prevent flash
    document.documentElement.style.setProperty('--primary', theme.primary_color);
    document.documentElement.style.setProperty('--primary-hover', theme.primary_hover_color);
    document.documentElement.style.setProperty('--secondary', theme.secondary_color);
    document.documentElement.style.setProperty('--accent', theme.accent_color);
    document.documentElement.dataset.theme = theme.site_title; // Store title in dataset for instant access
  }

  return (
    <ThemeContext.Provider value={{ settings, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}