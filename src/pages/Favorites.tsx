import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '../components/SimpleHeader';
import { ProductCard } from '../components/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { userFavorites, toggleFavorite, fetchUserFavorites } = useFavorites();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavoriteProducts();
    } else {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  async function fetchFavoriteProducts() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favorites } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (favorites && favorites.length > 0) {
        const productIds = favorites.map(f => f.product_id);
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        setFavoriteProducts(products || []);
      } else {
        setFavoriteProducts([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFavoriteClick = async (productId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    await toggleFavorite(productId);
    fetchFavoriteProducts();
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader onAuthClick={() => setShowAuthModal(true)} />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (!isAuthenticated) {
            navigate('/');
          }
        }}
        onSuccess={() => {
          fetchUserFavorites();
          fetchFavoriteProducts();
        }}
      />

      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Mes Favoris</h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-4">
              Vous n'avez pas encore de favoris
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
            >
              Découvrir des produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={userFavorites.has(product.id)}
                onFavoriteClick={handleFavoriteClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}