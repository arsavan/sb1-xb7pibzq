import React, { useState, useRef, TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types/database';
import { generateProductUrl } from '../utils/seo';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onFavoriteClick: (productId: string) => void;
  onAuthRequired: () => void;
}

export function ProductCard({ 
  product, 
  isFavorite, 
  onFavoriteClick, 
  onAuthRequired 
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [product.image_url, ...(product.images || [])];
  
  // Touch handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent event bubbling
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    onFavoriteClick(product.id);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(index);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;

    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden group card-hover animate-fadeIn h-full flex flex-col">
      {/* Image Container avec aspect ratio fixe */}
      <div 
        className="relative aspect-[4/3] w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={allImages[currentImageIndex]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain bg-gray-50"
          loading="lazy"
          draggable={false}
        />
        
        {/* Navigation arrows - Only show if there are multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => handlePrevImage(e)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100 md:block hidden"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => handleNextImage(e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100 md:block hidden"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dots navigation */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(index, e)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === index
                    ? 'bg-primary w-3'
                    : 'bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        <Link
          to={generateProductUrl(product.id, product.name)}
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button className="px-4 py-2 bg-primary text-white rounded-full flex items-center gap-2 hover:bg-primary-hover transition-colors">
            <ExternalLink size={16} />
            Plus de détails
          </button>
        </Link>
        {product.discount && (
          <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded-full text-sm font-medium">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 flex flex-col min-h-[120px]">
          <h3 className="font-medium text-sm mb-2 line-clamp-2 flex-none">
            {product.name}
          </h3>
          
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-background rounded-full text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={handleFavoriteClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                isAuthenticated 
                  ? isFavorite
                    ? 'bg-secondary/10'
                    : 'bg-background hover:bg-primary/10'
                  : 'bg-background hover:bg-primary/10'
              }`}
              title={isAuthenticated ? undefined : 'Connectez-vous pour ajouter aux favoris'}
            >
              <Heart
                size={16}
                className={isFavorite ? 'fill-secondary text-secondary' : 'text-text-secondary'}
              />
              <span className="text-sm text-text-secondary">
                ({product.favorites_count || 0})
              </span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{product.price}€</span>
          </div>
          <a
            href={product.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-accent text-white rounded-full text-sm hover:bg-accent/90 transition-colors"
          >
            Acheter
          </a>
        </div>
      </div>
    </div>
  );
}