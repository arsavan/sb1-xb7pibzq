import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, LogOut, KeyRound } from 'lucide-react';
import { SimpleHeader } from '../components/SimpleHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Mot de passe mis à jour avec succès');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader onAuthClick={() => setShowAuthModal(true)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />

      <main className="pt-24 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mon Compte</h1>
              <p className="text-text-secondary">{user.email}</p>
            </div>
          </div>

          {(error || success) && (
            <div className={`p-4 rounded-lg mb-6 ${
              error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {error || success}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/favorites')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-background hover:bg-primary/10 transition-colors text-left"
            >
              <Heart size={20} className="text-primary" />
              <span>Mes Favoris</span>
            </button>

            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-background hover:bg-primary/10 transition-colors text-left"
            >
              <KeyRound size={20} className="text-primary" />
              <span>Changer mon mot de passe</span>
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="p-4 bg-background rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Mettre à jour'}
                </button>
              </form>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-background hover:bg-red-50 text-red-600 transition-colors text-left"
            >
              <LogOut size={20} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}