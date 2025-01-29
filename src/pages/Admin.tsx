import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Tags, Palette, Settings, BarChart3, LogOut } from 'lucide-react';
import ProductsPanel from '../components/admin/ProductsPanel';
import TagsPanel from '../components/admin/TagsPanel';
import ThemePanel from '../components/admin/ThemePanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import { useAuth } from '../context/AuthContext';

type Panel = 'products' | 'tags' | 'theme' | 'settings' | 'analytics';

const MENU_ITEMS = [
  { id: 'products' as Panel, label: 'Produits', icon: LayoutGrid },
  { id: 'analytics' as Panel, label: 'Analytics', icon: BarChart3 },
  { id: 'tags' as Panel, label: 'Tags', icon: Tags },
  { id: 'theme' as Panel, label: 'Thème', icon: Palette },
  { id: 'settings' as Panel, label: 'Paramètres', icon: Settings },
];

export default function Admin() {
  const [activePanel, setActivePanel] = useState<Panel>('products');
  const { adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary mb-6">Administration</h1>
          <nav className="space-y-2">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activePanel === id
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-background'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Se déconnecter
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activePanel === 'products' && <ProductsPanel />}
        {activePanel === 'analytics' && <AnalyticsPanel />}
        {activePanel === 'tags' && <TagsPanel />}
        {activePanel === 'theme' && <ThemePanel />}
        {activePanel === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}