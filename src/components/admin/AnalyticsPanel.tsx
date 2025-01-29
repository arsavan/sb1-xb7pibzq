import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, ShoppingCart, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductAnalytics {
  id: string;
  name: string;
  views: number;
  clicks: number;
  homepage_clicks: number;
  total_interactions: number;
}

interface TimeRange {
  label: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: '7 derniers jours', days: 7 },
  { label: '30 derniers jours', days: 30 },
  { label: '90 derniers jours', days: 90 },
];

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(TIME_RANGES[0]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductAnalytics;
    direction: 'asc' | 'desc';
  }>({ key: 'total_interactions', direction: 'desc' });

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRange]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedRange.days);

      // Récupérer les statistiques
      const { data: stats, error: statsError } = await supabase
        .from('product_analytics')
        .select(`
          product_id,
          view_count,
          buy_click_count,
          homepage_buy_click_count,
          products (
            name
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (statsError) throw statsError;

      // Transformer les données
      const analyticsMap = new Map<string, ProductAnalytics>();

      stats?.forEach(stat => {
        const productId = stat.product_id;
        const existing = analyticsMap.get(productId) || {
          id: productId,
          name: stat.products.name,
          views: 0,
          clicks: 0,
          homepage_clicks: 0,
          total_interactions: 0
        };

        existing.views += stat.view_count || 0;
        existing.clicks += stat.buy_click_count || 0;
        existing.homepage_clicks += stat.homepage_buy_click_count || 0;
        existing.total_interactions = existing.views + existing.clicks + existing.homepage_clicks;

        analyticsMap.set(productId, existing);
      });

      const analyticsArray = Array.from(analyticsMap.values());
      
      // Trier les données
      const sortedAnalytics = analyticsArray.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });

      setAnalytics(sortedAnalytics);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (key: keyof ProductAnalytics) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key: keyof ProductAnalytics) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? '↓' : '↑';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Eye size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Vues totales</p>
              <p className="text-2xl font-bold">
                {analytics.reduce((sum, item) => sum + item.views, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <ShoppingCart size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Clics sur "Acheter"</p>
              <p className="text-2xl font-bold">
                {analytics.reduce((sum, item) => sum + item.clicks + item.homepage_clicks, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <BarChart3 size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Taux de conversion</p>
              <p className="text-2xl font-bold">
                {analytics.reduce((sum, item) => sum + item.views, 0) > 0
                  ? ((analytics.reduce((sum, item) => sum + item.clicks + item.homepage_clicks, 0) /
                      analytics.reduce((sum, item) => sum + item.views, 0)) *
                      100
                    ).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center gap-4 mb-6">
        <Calendar size={20} className="text-text-secondary" />
        <div className="flex gap-2">
          {TIME_RANGES.map(range => (
            <button
              key={range.days}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedRange.days === range.days
                  ? 'bg-primary text-white'
                  : 'bg-background text-text hover:bg-primary/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des statistiques par produit */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Produit {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('views')}
                >
                  Vues {getSortIcon('views')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('clicks')}
                >
                  Clics (Page produit) {getSortIcon('clicks')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('homepage_clicks')}
                >
                  Clics (Accueil) {getSortIcon('homepage_clicks')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total_interactions')}
                >
                  Total {getSortIcon('total_interactions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-secondary">
                    Chargement...
                  </td>
                </tr>
              ) : analytics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-secondary">
                    Aucune donnée disponible pour cette période
                  </td>
                </tr>
              ) : (
                analytics.map(item => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {item.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {item.clicks}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {item.homepage_clicks}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {item.total_interactions}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}