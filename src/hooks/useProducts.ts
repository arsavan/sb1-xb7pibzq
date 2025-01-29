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

    // Fonction pour vérifier si un intervalle contient des produits
    const hasProductsInRange = (min: number, max: number) => {
      return filteredProducts.some(p => p.price >= min && p.price <= max);
    };

    // Calcul des paliers en fonction de la plage de prix
    const ranges: [number, number][] = [];
    const range = maxPrice - minPrice;

    if (range <= 20) {
      // Pour les petits prix, paliers de 5€
      for (let i = minPrice; i < maxPrice; i += 5) {
        const rangeMin = i;
        const rangeMax = Math.min(i + 5, maxPrice);
        if (hasProductsInRange(rangeMin, rangeMax)) {
          ranges.push([rangeMin, rangeMax]);
        }
      }
    } else if (range <= 50) {
      // Paliers de 10€
      for (let i = minPrice; i < maxPrice; i += 10) {
        const rangeMin = i;
        const rangeMax = Math.min(i + 10, maxPrice);
        if (hasProductsInRange(rangeMin, rangeMax)) {
          ranges.push([rangeMin, rangeMax]);
        }
      }
    } else if (range <= 100) {
      // Paliers de 25€
      for (let i = minPrice; i < maxPrice; i += 25) {
        const rangeMin = i;
        const rangeMax = Math.min(i + 25, maxPrice);
        if (hasProductsInRange(rangeMin, rangeMax)) {
          ranges.push([rangeMin, rangeMax]);
        }
      }
    } else if (range <= 500) {
      // Paliers de 50€
      for (let i = minPrice; i < maxPrice; i += 50) {
        const rangeMin = i;
        const rangeMax = Math.min(i + 50, maxPrice);
        if (hasProductsInRange(rangeMin, rangeMax)) {
          ranges.push([rangeMin, rangeMax]);
        }
      }
    } else {
      // Pour les grands écarts de prix, paliers de 100€
      for (let i = minPrice; i < maxPrice; i += 100) {
        const rangeMin = i;
        const rangeMax = Math.min(i + 100, maxPrice);
        if (hasProductsInRange(rangeMin, rangeMax)) {
          ranges.push([rangeMin, rangeMax]);
        }
      }
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