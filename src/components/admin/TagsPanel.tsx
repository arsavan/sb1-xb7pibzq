import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface TagWithCount {
  name: string;
  count: number;
}

export default function TagsPanel() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('tags');

      if (error) throw error;

      // Count occurrences of each tag
      const tagCounts = new Map<string, number>();
      products?.forEach(product => {
        product.tags?.forEach(tag => {
          if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      // Convert to array and sort by count
      const sortedTags = Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setTags(sortedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Erreur lors du chargement des tags');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      // Get all products without this tag
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .not('tags', 'cs', `{${newTag}}`);

      if (fetchError) throw fetchError;

      // Add the new tag to each product's tags array
      const updates = products?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        amazon_url: product.amazon_url,
        tags: [...(product.tags || []), newTag.trim()]
      })) || [];

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .upsert(updates);

        if (updateError) throw updateError;
      }

      setNewTag('');
      await fetchTags();
    } catch (error) {
      console.error('Error adding tag:', error);
      setError('Erreur lors de l\'ajout du tag');
    }
  }

  async function handleDeleteTag(tagName: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ?`)) return;

    try {
      // Get all products with this tag
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .contains('tags', [tagName]);

      if (fetchError) throw fetchError;

      // Remove the tag from each product's tags array
      const updates = products?.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        amazon_url: product.amazon_url,
        tags: (product.tags || []).filter(tag => tag !== tagName)
      })) || [];

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .upsert(updates);

        if (updateError) throw updateError;
      }

      await fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError('Erreur lors de la suppression du tag');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion des Tags</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Tag Form */}
      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleAddTag} className="flex gap-4">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Nouveau tag..."
            className="flex-1 rounded-md border-border bg-background shadow-sm focus:border-primary focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newTag.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Plus size={20} className="mr-2" />
            Ajouter
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Utilisations
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-text-secondary">
                    Chargement...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-text-secondary">
                    Aucun tag disponible
                  </td>
                </tr>
              ) : (
                tags.map(tag => (
                  <tr key={tag.name} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {tag.count} produit{tag.count > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTag(tag.name)}
                        className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
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