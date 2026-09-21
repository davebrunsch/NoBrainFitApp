import React, { useState } from 'react';
import { store, calculateBmi, calculateBmr, calculateTdee, calculateDailyCalorieTarget } from '../lib/store';
import { AiBackend } from '../types';
import {
  ArrowLeft,
  User,
  Sliders,
  Sparkles,
  RotateCcw,
  LogOut,
  Flame,
  Zap,
  Activity,
  Award,
  Bell,
  Volume2,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onEditProfile,
  onLogout,
}) => {
  const profile = store.getUserProfile();
  const [aiConfig, setAiConfig] = useState(store.getAiConfig());
  const [trainingPrefs, setTrainingPrefs] = useState(store.getTrainingPrefs());

  const bmi = calculateBmi(profile.heightCm, profile.weightKg);
  const bmr = calculateBmr(profile);
  const tdee = calculateTdee(profile);
  const dailyTarget = calculateDailyCalorieTarget(profile);

  const handleBackendChange = (backend: AiBackend) => {
    const updated = { ...aiConfig, backend };
    setAiConfig(updated);
    store.setAiConfig(updated);
  };

  const handleRestChange = (sec: number) => {
    const updated = { ...trainingPrefs, defaultRestSec: sec };
    setTrainingPrefs(updated);
    store.setTrainingPrefs(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...trainingPrefs, sound: !trainingPrefs.sound };
    setTrainingPrefs(updated);
    store.setTrainingPrefs(updated);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between pb-16">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
            Paramètres
          </span>
          <div className="w-10" />
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
            Compte & Métabolisme
          </span>
          <h2 className="font-head text-[24px] font-bold text-[#F2F2F4]">
            Profil & Réglages
          </h2>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-[22px] bg-[#16161B] border border-white/8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 flex items-center justify-center text-[#C4ED4A] font-head font-bold text-[18px]">
                {profile.sex === 'male' ? 'H' : 'F'}
              </div>
              <div>
                <h3 className="font-head text-[17px] font-bold text-white">
                  {aiConfig.serverEmail ? aiConfig.serverEmail.split('@')[0] : 'Athlète NoBrainFit'}
                </h3>
                <span className="text-[12px] text-[#86868F]">
                  {profile.age} ans · {profile.weightKg} kg · {profile.heightCm} cm
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="text-[12px] font-mono text-[#C4ED4A] hover:underline"
            >
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/6 text-center">
            <div>
              <div className="font-mono text-[14px] font-bold text-white">{bmi}</div>
              <div className="text-[9px] text-[#86868F] uppercase font-mono">IMC</div>
            </div>
            <div>
              <div className="font-mono text-[14px] font-bold text-white">{bmr}</div>
              <div className="text-[9px] text-[#86868F] uppercase font-mono">BMR</div>
            </div>
            <div>
              <div className="font-mono text-[14px] font-bold text-white">{tdee}</div>
              <div className="text-[9px] text-[#86868F] uppercase font-mono">TDEE</div>
            </div>
            <div>
              <div className="font-mono text-[14px] font-bold text-[#C4ED4A]">{dailyTarget}</div>
              <div className="text-[9px] text-[#C4ED4A] uppercase font-mono">Cible kcal</div>
            </div>
          </div>
        </div>

        {/* Training preferences */}
        <div className="p-5 rounded-[20px] bg-[#16161B] border border-white/8 mb-6">
          <h4 className="font-head text-[15px] font-bold text-white mb-3 flex items-center gap-2">
            <Sliders size={16} className="text-[#C4ED4A]" />
            <span>Séance guidée & Chrono</span>
          </h4>

          <div className="mb-4">
            <label className="block text-[12px] text-[#86868F] font-mono uppercase mb-2">
              Temps de repos par défaut
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleRestChange(s)}
                  className={`py-2 rounded-[10px] font-mono text-[13px] font-bold border transition-all ${
                    trainingPrefs.defaultRestSec === s
                      ? 'bg-[#C4ED4A]/15 border-[#C4ED4A] text-[#C4ED4A]'
                      : 'bg-[#1C1C22] border-white/8 text-[#86868F]'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/6">
            <span className="text-[13px] text-[#D8D8DE]">Signaux sonores de fin de repos</span>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                trainingPrefs.sound ? 'bg-[#C4ED4A]' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#0B0B0F] transition-transform ${
                  trainingPrefs.sound ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* AI Engine Settings */}
        <div className="p-5 rounded-[20px] bg-[#16161B] border border-white/8 mb-6">
          <h4 className="font-head text-[15px] font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-[#C4ED4A]" />
            <span>Moteur d'Intelligence Artificielle</span>
          </h4>
          <p className="text-[12px] text-[#86868F] mb-4">
            NoBrainFit embarque un modèle instantané hors-ligne pour fonctionner sans latence.
          </p>

          <div className="space-y-2">
            {[
              { id: 'demo', label: 'Mode Démo (Intégré & Offline)', sub: 'Génération instantanée' },
              { id: 'gemini', label: 'Google Gemini Flash (Cloud)', sub: 'Haute précision nutritionnelle' },
              { id: 'server', label: 'Serveur API NoBrainFit', sub: 'Connexion directe backend' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleBackendChange(opt.id as AiBackend)}
                className={`w-full p-3 rounded-[12px] border text-left flex items-center justify-between transition-all ${
                  aiConfig.backend === opt.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]'
                    : 'bg-[#1C1C22] border-white/8 text-[#86868F]'
                }`}
              >
                <div>
                  <div className={`text-[13px] font-bold ${aiConfig.backend === opt.id ? 'text-[#C4ED4A]' : 'text-white'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-[#86868F]">{opt.sub}</div>
                </div>
                {aiConfig.backend === opt.id && (
                  <div className="w-2 h-2 rounded-full bg-[#C4ED4A]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone / Logout */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 px-4 rounded-[14px] bg-rose-500/10 border border-rose-500/25 text-rose-400 font-head font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
