import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { SimpleHeader } from '../components/SimpleHeader';
import { useTheme } from '../context/ThemeContext';

export default function NotFound() {
  const { settings } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader onAuthClick={() => {}} />

      <main className="pt-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
          <p className="text-text-secondary mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors w-full sm:w-auto justify-center"
            >
              <Home size={20} />
              Retour à l'accueil
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-background text-text border border-border rounded-full hover:bg-primary/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Search size={20} />
              Rechercher un produit
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}