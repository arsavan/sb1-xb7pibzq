import React, { useState, useEffect } from 'react';
import { Euro, Tag, User, Heart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMenuOpen: boolean;
  selectedTags: string[];
  availableTags: string[];
  onTagClick: (tag: string) => void;
  getPriceRanges: (selectedTags: string[]) => [number, number][];
  onPriceRangeChange: (range: [number, number] | null) => void;
  onAuthClick: () => void;
}

export function Sidebar({ 
  isMenuOpen, 
  selectedTags,
  availableTags,
  onTagClick,
  getPriceRanges,
  onPriceRangeChange,
  onAuthClick
}: SidebarProps) {
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const priceRanges = getPriceRanges(selectedTags);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Reset selected range when tags change
  useEffect(() => {
    setSelectedRange(null);
    onPriceRangeChange(null);
  }, [selectedTags]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className={`fixed left-0 top-[7rem] h-[calc(100vh-7rem)] bg-card border-r border-border transition-all duration-300 ${
      isMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
    } overflow-y-auto z-40 shadow-lg`}>
      <div className="p-6 space-y-6">
        {/* Account Section - Only visible on mobile */}
        <div className="md:hidden">
          <h3 className="font-medium mb-4 text-lg flex items-center gap-2">
            <User size={20} className="text-primary" />
            Compte
          </h3>
          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-background hover:bg-primary/10 transition-colors"
                >
                  <User size={18} />
                  Mon compte
                </Link>
                <Link
                  to="/favorites"
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-background hover:bg-primary/10 transition-colors"
                >
                  <Heart size={18} />
                  Mes favoris
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Se déconnecter
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                <User size={18} />
                Se connecter
              </button>
            )}
          </div>
        </div>

        {/* Tags Section - Only visible on mobile */}
        <div className="md:hidden">
          <h3 className="font-medium mb-4 text-lg flex items-center gap-2">
            <Tag size={20} className="text-primary" />
            Catégories
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onTagClick('Tous')}
              className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedTags.length === 0
                  ? 'bg-primary text-white'
                  : 'bg-background text-text hover:bg-primary/10'
              }`}
            >
              Tous
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-background text-text hover:bg-primary/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Price Ranges Section */}
        <div>
          <h3 className="font-medium mb-4 text-lg flex items-center gap-2">
            <Euro size={20} className="text-primary" />
            Prix
          </h3>
          <div className="space-y-2">
            {priceRanges.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Aucun produit disponible pour les filtres sélectionnés
              </p>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedRange(null);
                    onPriceRangeChange(null);
                  }}
                  className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedRange === null
                      ? 'bg-primary text-white'
                      : 'bg-background text-text hover:bg-primary/10'
                  }`}
                >
                  Tous les prix
                </button>
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedRange(range);
                      onPriceRangeChange(range);
                    }}
                    className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedRange && 
                      selectedRange[0] === range[0] && 
                      selectedRange[1] === range[1]
                        ? 'bg-primary text-white'
                        : 'bg-background text-text hover:bg-primary/10'
                    }`}
                  >
                    {range[0]}€ - {range[1]}€
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}