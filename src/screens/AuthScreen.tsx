import React, { useState } from 'react';
import { TriStrikeWordmark } from '../components/TriStrikeLogo';
import { store } from '../lib/store';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      setError('Remplis tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      store.setUserProfile({
        ...store.getUserProfile(),
        completed: false, // New user needs onboarding
      });
      store.setAiConfig({
        ...store.getAiConfig(),
        serverEmail: email.trim(),
        backend: 'demo',
      });
      onSuccess();
    }, 400);
  };

  const handleEnterDemo = () => {
    store.enterDemoMode();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col justify-center px-5 py-8 sm:px-6 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <TriStrikeWordmark markSize={36} className="justify-center mb-3" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#86868F]">
          Zéro réflexion · Résultat immédiat
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[#16161B] border border-white/10 rounded-[20px] p-6 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="font-head text-[22px] font-bold text-[#F2F2F4]">
            {isRegister ? 'Crée ton compte' : 'Content de te revoir'}
          </h2>
          <p className="text-[13px] text-[#86868F] mt-1">
            {isRegister
              ? 'Rejoins NoBrainFit et calibre ton métabolisme'
              : 'Connecte-toi pour retrouver tes séances'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#86868F] mb-1.5 font-bold">
                Prénom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full px-3.5 py-3 rounded-[12px] bg-[#1C1C22] border border-white/10 text-white placeholder-white/25 focus:border-[#C4ED4A] focus:outline-none transition-colors text-[14px]"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#86868F] mb-1.5 font-bold">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3.5 py-3 rounded-[12px] bg-[#1C1C22] border border-white/10 text-white placeholder-white/25 focus:border-[#C4ED4A] focus:outline-none transition-colors text-[14px]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#86868F] mb-1.5 font-bold">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 rounded-[12px] bg-[#1C1C22] border border-white/10 text-white placeholder-white/25 focus:border-[#C4ED4A] focus:outline-none transition-colors text-[14px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-[12px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0B0B0F] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Commencer' : 'Se connecter'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-[13px] text-[#86868F] hover:text-[#C4ED4A] transition-colors"
          >
            {isRegister
              ? 'Déjà un compte ? Connecte-toi'
              : 'Pas encore de compte ? S\'inscrire'}
          </button>
        </div>
      </div>

      {/* Instant Demo Button */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleEnterDemo}
          className="w-full py-3 px-4 rounded-[14px] bg-white/5 border border-white/10 text-[#D8D8DE] hover:border-[#C4ED4A]/40 hover:text-[#C4ED4A] font-head font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles size={16} className="text-[#C4ED4A]" />
          <span>Explorer en Mode Démo (sans inscription)</span>
        </button>
        <p className="font-mono text-[10px] text-[#55555E] mt-2">
          Génère séances et repas instantanément
        </p>
      </div>
    </div>
  );
};
