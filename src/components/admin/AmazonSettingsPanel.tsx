import React, { useState, useEffect } from 'react';
import { Save, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AmazonSettings {
  id?: string;
  access_key_id: string;
  secret_access_key: string;
  partner_tag: string;
  host: string;
}

export default function AmazonSettingsPanel() {
  const [settings, setSettings] = useState<AmazonSettings>({
    access_key_id: '',
    secret_access_key: '',
    partner_tag: '',
    host: 'webservices.amazon.fr'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('amazon_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching Amazon settings:', error);
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
      const { error } = settings.id
        ? await supabase
            .from('amazon_settings')
            .update({
              access_key_id: settings.access_key_id,
              secret_access_key: settings.secret_access_key,
              partner_tag: settings.partner_tag,
              host: settings.host
            })
            .eq('id', settings.id)
        : await supabase
            .from('amazon_settings')
            .insert([settings]);

      if (error) throw error;

      setSuccess('Paramètres Amazon mis à jour avec succès');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving Amazon settings:', error);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Configuration Amazon API</h3>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Access Key ID
          </label>
          <input
            type="text"
            value={settings.access_key_id}
            onChange={e => setSettings(prev => ({ ...prev, access_key_id: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Secret Access Key
          </label>
          <input
            type="password"
            value={settings.secret_access_key}
            onChange={e => setSettings(prev => ({ ...prev, secret_access_key: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Partner Tag (ID d'associé)
          </label>
          <input
            type="text"
            value={settings.partner_tag}
            onChange={e => setSettings(prev => ({ ...prev, partner_tag: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Host
          </label>
          <input
            type="text"
            value={settings.host}
            onChange={e => setSettings(prev => ({ ...prev, host: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <p className="mt-1 text-sm text-text-secondary">
            Par défaut: webservices.amazon.fr
          </p>
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
  );
}