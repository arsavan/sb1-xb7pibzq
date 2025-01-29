import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { slugify } from '../../../utils/seo';

interface Settings {
  id?: string;
  site_url: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function GeneralSettings() {
  const [settings, setSettings] = useState<Settings>({
    site_url: 'https://craquetabudget.com'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('id, site_url')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async function retry<T>(
    operation: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await wait(RETRY_DELAY);
        return retry(operation, retries - 1);
      }
      throw error;
    }
  }

  async function regenerateSitemap() {
    try {
      setRegenerating(true);
      setError(null);

      const { data: products } = await retry(() => 
        supabase
          .from('products')
          .select('id, name')
          .order('created_at', { ascending: false })
      );

      let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${settings.site_url}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${settings.site_url}/favorites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${settings.site_url}/dashboard</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

      if (products && products.length > 0) {
        products.forEach(product => {
          const slug = slugify(product.name);
          sitemapContent += `
  <url>
    <loc>${settings.site_url}/product/${product.id}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
      }

      sitemapContent += '\n</urlset>';

      const sitemapBlob = new Blob([sitemapContent], { type: 'application/xml' });
      const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${settings.site_url}/sitemap.xml

# Prevent access to admin pages
Disallow: /admin/
Disallow: /admin/*`;
      const robotsBlob = new Blob([robotsContent], { type: 'text/plain' });

      await retry(() => 
        Promise.all([
          supabase.storage.from('public').remove(['sitemap.xml']),
          supabase.storage.from('public').remove(['robots.txt'])
        ])
      );

      await retry(() => 
        Promise.all([
          supabase.storage
            .from('public')
            .upload('sitemap.xml', sitemapBlob, {
              upsert: true,
              contentType: 'application/xml',
              cacheControl: '3600'
            }),
          supabase.storage
            .from('public')
            .upload('robots.txt', robotsBlob, {
              upsert: true,
              contentType: 'text/plain',
              cacheControl: '3600'
            })
        ])
      );

      setSuccess('Sitemap et robots.txt régénérés avec succès');
    } catch (error: any) {
      console.error('Error regenerating sitemap:', error);
      setError('Erreur lors de la régénération du sitemap');
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({ site_url: settings.site_url })
        .eq('id', settings.id);

      if (error) throw error;

      await regenerateSitemap();
      setSuccess('Paramètres mis à jour avec succès');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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

      <div className="bg-card rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              URL du site
            </label>
            <input
              type="url"
              value={settings.site_url}
              onChange={e => setSettings(prev => ({ ...prev, site_url: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com"
              required
            />
            <p className="mt-1 text-sm text-text-secondary">
              Cette URL sera utilisée pour générer le sitemap et le robots.txt
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              Sauvegarder
            </button>

            <button
              type="button"
              onClick={() => regenerateSitemap()}
              disabled={regenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={regenerating ? 'animate-spin' : ''} />
              Régénérer le sitemap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}