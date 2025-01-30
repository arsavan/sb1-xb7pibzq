import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, ShoppingBag, Store, Package, Gift, Tag, Percent, CreditCard, Wallet, DollarSign, Euro, Banknote, Search, User, DivideIcon as LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAuthClick: () => void;
  availableTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const HEADER_ICONS: Record<string, LucideIcon> = {
  ShoppingCart,
  ShoppingBag,
  Store,
  Package,
  Gift,
  Tag,
  Percent,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  Banknote
};

export function Header({
  isMenuOpen,
  setIsMenuOpen,
  searchQuery,
  setSearchQuery,
  onAuthClick,
  availableTags,
  selectedTags,
  setSelectedTags
}: HeaderProps) {
  const { settings } = useTheme();
  const { isAuthenticated } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);

  const handleTitleClick = () => {
    setSearchQuery('');
    setSelectedTags([]);
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

  // Close account menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-menu')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Get the correct icon component based on settings
  const HeaderIcon = settings.header_icon ? HEADER_ICONS[settings.header_icon] : ShoppingCart;

  return (
    <header className="fixed top-0 left-0 right-0 bg-card z-50 flex flex-col px-4 border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-background rounded-full transition-colors"
          >
            <Menu size={24} className="text-text" />
          </button>
          <Link to="/" onClick={handleTitleClick} className="flex items-center gap-2">
            <HeaderIcon size={24} className="text-primary" />
            <span 
              className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              style={{ opacity: settings ? 1 : 0 }}
            >
              {settings.site_title}
            </span>
          </Link>
        </div>

        {/* Desktop Search and Auth */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>
          <div className="relative account-menu">
            <button
              onClick={() => isAuthenticated ? setShowAccountMenu(!showAccountMenu) : onAuthClick()}
              className="p-2 hover:bg-background rounded-full transition-colors"
            >
              <User size={24} className={isAuthenticated ? "text-primary" : "text-text"} />
            </button>
            
            {/* Account Menu Dropdown */}
            {isAuthenticated && showAccountMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-text hover:bg-background"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Mon Compte
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-2 text-sm text-text hover:bg-background"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Mes Favoris
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Only visible on mobile */}
      <div className="md:hidden py-3 px-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        </div>
      </div>

      {/* Tags - Only visible on desktop */}
      <div className="h-12 hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {availableTags.length > 0 ? (
          availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                tag === 'Tous'
                  ? selectedTags.length === 0
                    ? 'bg-primary text-white'
                    : 'bg-background text-text hover:bg-primary/10'
                  : selectedTags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-background text-text hover:bg-primary/10'
              }`}
            >
              {tag}
            </button>
          ))
        ) : (
          <div className="text-text-secondary text-sm">Aucune catégorie disponible</div>
        )}
      </div>
    </header>
  );
}