import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SimpleHeaderProps {
  onAuthClick: () => void;
}

export function SimpleHeader({ onAuthClick }: SimpleHeaderProps) {
  const { settings } = useTheme();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    // Navigate to home and force a fresh state
    navigate('/', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card z-50 px-4 h-16 flex items-center justify-between border-b border-border shadow-sm">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 hover:bg-background rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-text" />
        </Link>
        <div 
          onClick={handleTitleClick}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ShoppingCart size={24} className="text-primary" />
          <span 
            className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            style={{ opacity: settings ? 1 : 0 }}
          >
            {settings.site_title}
          </span>
        </div>
      </div>
      {/* L'icône de compte n'est visible que sur desktop */}
      <button
        onClick={onAuthClick}
        className="hidden md:block p-2 hover:bg-background rounded-full transition-colors"
      >
        <User size={24} className="text-text" />
      </button>
    </header>
  );
}