import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RotateCcw } from 'lucide-react';

interface ThemeSettings {
  id?: string;
  site_title: string;
  primary_color: string;
  primary_hover_color: string;
  secondary_color: string;
  accent_color: string;
  is_active?: boolean;
}

const defaultSettings: ThemeSettings = {
  site_title: 'CraqueTonBudget',
  primary_color: '#6366f1',
  primary_hover_color: '#4f46e5',
  secondary_color: '#ec4899',
  accent_color: '#8b5cf6'
};

export default function ThemePanel() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply theme changes in real-time
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
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // If no active theme exists, create one with default settings
        const { data: newData, error: insertError } = await supabase
          .from('theme_settings')
          .insert([{ ...defaultSettings, is_active: true }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (newData) setSettings(newData);
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (settings.id) {
        // Update existing theme
        const { error } = await supabase
          .from('theme_settings')
          .update({
            site_title: settings.site_title,
            primary_color: settings.primary_color,
            primary_hover_color: settings.primary_hover_color,
            secondary_color: settings.secondary_color,
            accent_color: settings.accent_color
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Should never happen due to fetchSettings logic, but handle it just in case
        const { error } = await supabase
          .from('theme_settings')
          .insert([{ ...settings, is_active: true }]);

        if (error) throw error;
      }

      setSuccess('Thème mis à jour avec succès');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving theme settings:', error);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres du thème ?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (settings.id) {
        // Update existing theme with default values
        const { error } = await supabase
          .from('theme_settings')
          .update({
            site_title: defaultSettings.site_title,
            primary_color: defaultSettings.primary_color,
            primary_hover_color: defaultSettings.primary_hover_color,
            secondary_color: defaultSettings.secondary_color,
            accent_color: defaultSettings.accent_color
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Should never happen due to fetchSettings logic, but handle it just in case
        const { error } = await supabase
          .from('theme_settings')
          .insert([{ ...defaultSettings, is_active: true }]);

        if (error) throw error;
      }

      setSuccess('Thème réinitialisé avec succès');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error resetting theme:', error);
      setError('Erreur lors de la réinitialisation du thème');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Personnalisation du thème</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          disabled={loading}
        >
          <RotateCcw size={20} />
          Réinitialiser
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-card rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Titre du site
              </label>
              <input
                type="text"
                value={settings.site_title}
                onChange={e => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Couleur primaire
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={e => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={e => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Couleur primaire (hover)
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={settings.primary_hover_color}
                  onChange={e => setSettings(prev => ({ ...prev, primary_hover_color: e.target.value }))}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings.primary_hover_color}
                  onChange={e => setSettings(prev => ({ ...prev, primary_hover_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Couleur secondaire
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={e => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={e => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Couleur d'accent
              </label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={e => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={e => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              Sauvegarder
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Aperçu</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">En-tête</h4>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {settings.site_title}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Boutons</h4>
                <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-4">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                    Bouton primaire
                  </button>
                  <button className="px-4 py-2 bg-secondary text-white rounded-lg transition-colors">
                    Bouton secondaire
                  </button>
                  <button className="px-4 py-2 bg-accent text-white rounded-lg transition-colors">
                    Bouton accent
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-2">Badges</h4>
                <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Badge primaire
                  </span>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                    Badge secondaire
                  </span>
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-sm">
                    Badge accent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}