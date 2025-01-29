import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag } from 'lucide-react';
import { SimpleHeader } from '../components/SimpleHeader';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import AuthModal from '../components/AuthModal';
import { useFavorites } from '../hooks/useFavorites';
import { generateProductUrl } from '../utils/seo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProductDetail() {
  const { settings } = useTheme();
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { userFavorites, toggleFavorite, fetchUserFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    // Redirect to SEO-friendly URL if needed
    if (product && (!slug || generateProductUrl(product.id, product.name) !== `/product/${id}/${slug}`)) {
      navigate(generateProductUrl(product.id, product.name), { replace: true });
    }
  }, [product, slug]);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFavoriteClick = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const success = await toggleFavorite(product.id);
    if (success) {
      fetchProduct();
    }
  };

  if (!id) return <Navigate to="/" />;

  // Format price for structured data
  const getStructuredData = () => {
    if (!product) return null;

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.image_url,
      "offers": {
        "@type": "Offer",
        "url": `${settings.site_url}${generateProductUrl(product.id, product.name)}`,
        "priceCurrency": "EUR",
        "price": product.price,
        "availability": "https://schema.org/InStock"
      }
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {product && (
        <Helmet>
          <title>{`${product.name} - ${settings.site_title}`}</title>
          <meta name="description" content={product.description || `Découvrez ${product.name} sur ${settings.site_title}`} />
          <meta name="keywords" content={`${product.tags.join(', ')}, bons plans, économies`} />
          
          {/* Open Graph */}
          <meta property="og:title" content={`${product.name} - ${settings.site_title}`} />
          <meta property="og:description" content={product.description || `Découvrez ${product.name} sur ${settings.site_title}`} />
          <meta property="og:image" content={product.image_url} />
          <meta property="og:url" content={`${settings.site_url}${generateProductUrl(product.id, product.name)}`} />
          <meta property="og:type" content="product" />
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content="EUR" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${product.name} - ${settings.site_title}`} />
          <meta name="twitter:description" content={product.description || `Découvrez ${product.name} sur ${settings.site_title}`} />
          <meta name="twitter:image" content={product.image_url} />
          
          {/* Canonical URL */}
          <link rel="canonical" href={`${settings.site_url}${generateProductUrl(product.id, product.name)}`} />

          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify(getStructuredData())}
          </script>
        </Helmet>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          fetchUserFavorites();
          fetchProduct();
        }}
      />

      <SimpleHeader onAuthClick={() => setShowAuthModal(true)} />

      <main className="pt-16 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-red-500">Une erreur est survenue</div>
          </div>
        ) : !product ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-text-secondary">Produit non trouvé</div>
          </div>
        ) : (
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="relative bg-card rounded-2xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-center p-8">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                  />
                </div>
                {product.discount && (
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleFavoriteClick}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                        isAuthenticated 
                          ? userFavorites.has(product.id)
                            ? 'bg-secondary/10'
                            : 'bg-background hover:bg-primary/10'
                          : 'bg-background hover:bg-primary/10'
                      }`}
                      title={isAuthenticated ? undefined : 'Connectez-vous pour ajouter aux favoris'}
                    >
                      <Heart
                        size={20}
                        className={userFavorites.has(product.id) ? 'fill-secondary text-secondary' : 'text-text-secondary'}
                      />
                      <span className="text-sm font-medium text-text-secondary">
                        ({product.favorites_count || 0})
                      </span>
                    </button>
                  </div>
                  <div 
                    className="prose max-w-none text-text-secondary"
                    dangerouslySetInnerHTML={{ __html: product.description || 'Aucune description disponible' }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-background rounded-full text-sm text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-end gap-4 mb-6">
                    <div className="text-4xl font-bold text-primary">
                      {product.price}€
                    </div>
                    {product.discount && (
                      <div className="text-lg text-text-secondary line-through">
                        {(product.price / (1 - product.discount / 100)).toFixed(2)}€
                      </div>
                    )}
                  </div>

                  <a
                    href={product.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full md:w-auto px-8 py-3 bg-accent hover:bg-accent/90 text-white rounded-full text-lg font-medium transition-colors"
                  >
                    <ShoppingBag size={20} className="mr-2" />
                    Acheter sur Amazon
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}