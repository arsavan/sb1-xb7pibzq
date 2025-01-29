import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeSettings {
  site_title: string;
  primary_color: string;
  primary_hover_color: string;
  secondary_color: string;
  accent_color: string;
}

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>({
    site_title: 'CraqueTonBudget',
    primary_color: '#6366f1',
    primary_hover_color: '#4f46e5',
    secondary_color: '#ec4899',
    accent_color: '#8b5cf6'
  });

  useEffect(() => {
    fetchSettings();
    
    // Subscribe to theme changes
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
    // Apply theme settings
    document.documentElement.style.setProperty('--primary', settings.primary_color);
    document.documentElement.style.setProperty('--primary-hover', settings.primary_hover_color);
    document.documentElement.style.setProperty('--secondary', settings.secondary_color);
    document.documentElement.style.setProperty('--accent', settings.accent_color);
  }, [settings]);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
    }
  }

  return settings;
}