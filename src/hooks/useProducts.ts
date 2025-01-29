import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      // Extract unique tags
      const tags = new Set<string>();
      data?.forEach(product => {
        if (Array.isArray(product.tags)) {
          product.tags.forEach(tag => {
            if (tag) tags.add(tag);
          });
        }
      });
      setAvailableTags(Array.from(tags));

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate price ranges based on available products and selected tags
  const getPriceRanges = (selectedTags: string[]) => {
    const filteredProducts = products.filter(product => 
      selectedTags.length === 0 || selectedTags.every(tag => product.tags?.includes(tag))
    );

    if (filteredProducts.length === 0) return [];

    const prices = filteredProducts.map(p => p.price);
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));

    // Calculate price ranges with dynamic steps
    const range = maxPrice - minPrice;
    let step: number;

    if (range <= 50) step = 10;
    else if (range <= 100) step = 20;
    else if (range <= 500) step = 50;
    else if (range <= 1000) step = 100;
    else step = 250;

    const ranges: [number, number][] = [];
    for (let i = minPrice; i < maxPrice; i += step) {
      ranges.push([i, Math.min(i + step, maxPrice)]);
    }

    return ranges;
  };

  return {
    products,
    availableTags,
    loading,
    error,
    fetchProducts,
    getPriceRanges
  };
}