import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent event bubbling
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    onFavoriteClick(product.id);
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden group card-hover animate-fadeIn h-full flex flex-col">
      {/* Image Container avec aspect ratio fixe */}
      <div className="relative aspect-[4/3] w-full">
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain bg-gray-50"
          loading="lazy"
        />
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