import React, { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';

interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  link: string;
}

interface AmazonSearchProps {
  onProductSelect: (product: AmazonProduct) => void;
}

export default function AmazonSearch({ onProductSelect }: AmazonSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AmazonProduct[]>([]);

  const searchProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/amazon/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Rechercher sur Amazon</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={searchProducts} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" 
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search size={20} />
                Rechercher
              </>
            )}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((product) => (
            <div 
              key={product.asin}
              className="bg-background rounded-lg p-4 border border-border hover:border-primary transition-colors"
            >
              <div className="aspect-square mb-4 bg-white rounded-lg overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-medium mb-2 line-clamp-2">{product.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {product.price}€
                </span>
                <button
                  onClick={() => onProductSelect(product)}
                  className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}