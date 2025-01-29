import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../hooks/useProducts';
import { useFavorites } from '../hooks/useFavorites';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ProductCard } from '../components/ProductCard';
import { AdSense } from '../components/AdSense';
import AuthModal from '../components/AuthModal';
import { Toast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

export default function Store() {
  const { settings } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 768);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPriceRange, setCurrentPriceRange] = useState<[number, number] | null>(null);

  const { 
    products, 
    availableTags,
    loading, 
    error,
    getPriceRanges,
    fetchProducts
  } = useProducts();

  const { 
    userFavorites, 
    toggleFavorite, 
    fetchUserFavorites,
    toast,
    clearToast
  } = useFavorites();

  const handleFavoriteClick = async (productId: string) => {
    const success = await toggleFavorite(productId);
    if (success) {
      fetchProducts();
    }
  };

  const handleTagClick = (tag: string) => {
    if (tag === 'Tous') {
      setSelectedTags([]);
    } else {
      setSelectedTags(
        selectedTags.includes(tag)
          ? selectedTags.filter(t => t !== tag)
          : [...selectedTags, tag]
      );
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesTags = selectedTags.length === 0 || 
      product.tags?.some(tag => selectedTags.includes(tag));
    
    const matchesPrice = !currentPriceRange || 
      (product.price >= currentPriceRange[0] && product.price <= currentPriceRange[1]);
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTags && matchesPrice && matchesSearch;
  });

  // Prepare meta description based on current filters
  const getMetaDescription = () => {
    let description = `Découvrez les meilleurs bons plans sur ${settings.site_title}`;
    if (selectedTags.length > 0) {
      description += ` dans les catégories ${selectedTags.join(', ')}`;
    }
    if (searchQuery) {
      description += ` correspondant à "${searchQuery}"`;
    }
    return description;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${settings.site_title} - Les meilleurs bons plans`}</title>
        <meta name="description" content={getMetaDescription()} />
        <meta name="keywords" content={`bons plans, économies, ${availableTags.join(', ')}`} />
        <link rel="canonical" href={`${settings.site_url}/`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${settings.site_title} - Les meilleurs bons plans`} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={settings.site_url} />
        
        {/* Twitter */}
        <meta name="twitter:title" content={`${settings.site_title} - Les meilleurs bons plans`} />
        <meta name="twitter:description" content={getMetaDescription()} />
      </Helmet>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          fetchUserFavorites();
          fetchProducts();
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={clearToast}
        />
      )}

      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAuthClick={() => setShowAuthModal(true)}
        availableTags={['Tous', ...availableTags]}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />

      <div className="flex pt-[7rem]">
        <Sidebar
          isMenuOpen={isMenuOpen}
          selectedTags={selectedTags}
          availableTags={availableTags}
          onTagClick={handleTagClick}
          getPriceRanges={getPriceRanges}
          onPriceRangeChange={setCurrentPriceRange}
          onAuthClick={() => setShowAuthModal(true)}
        />

        <main className={`flex-1 p-6 transition-all duration-300 ${isMenuOpen ? 'md:ml-64' : 'ml-0'}`}>
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg animate-fadeIn">
              {error}
            </div>
          )}

          {/* Annonce en haut de la liste des produits */}
          <div className="mb-6">
            <AdSense
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_TOP}
              className="w-full max-w-[728px] mx-auto"
              style={{ minHeight: '90px' }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-text-secondary">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                Chargement...
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-text-secondary">
                Aucun produit disponible
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-text-secondary">
                Aucun produit ne correspond aux critères de recherche
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ProductCard
                    product={product}
                    isFavorite={userFavorites.has(product.id)}
                    onFavoriteClick={handleFavoriteClick}
                    onAuthRequired={() => setShowAuthModal(true)}
                  />
                  {/* Annonce tous les 8 produits */}
                  {(index + 1) % 8 === 0 && (
                    <div className="col-span-full my-6">
                      <AdSense
                        adSlot={import.meta.env.VITE_ADSENSE_SLOT_MIDDLE}
                        className="w-full max-w-[728px] mx-auto"
                        style={{ minHeight: '90px' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>

          {/* Annonce en bas de la liste des produits */}
          {filteredProducts.length > 0 && (
            <div className="mt-6">
              <AdSense
                adSlot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM}
                className="w-full max-w-[728px] mx-auto"
                style={{ minHeight: '90px' }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}