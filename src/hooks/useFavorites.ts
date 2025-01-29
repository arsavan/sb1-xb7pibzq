import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFavorites() {
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUserFavorites();
  }, []);

  async function fetchUserFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserFavorites(new Set(data.map(f => f.product_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  async function toggleFavorite(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      if (userFavorites.has(productId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        setUserFavorites(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });

        setToast({
          message: 'Produit retiré des favoris',
          type: 'success'
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, product_id: productId }]);

        if (error) throw error;
        
        setUserFavorites(prev => new Set([...prev, productId]));
        
        setToast({
          message: 'Produit ajouté aux favoris',
          type: 'success'
        });
      }
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setToast({
        message: 'Une erreur est survenue',
        type: 'error'
      });
      return false;
    }
  }

  return {
    userFavorites,
    toggleFavorite,
    fetchUserFavorites,
    toast,
    clearToast: () => setToast(null)
  };
}