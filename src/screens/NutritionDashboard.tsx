import React, { useState, useEffect } from 'react';
import { store, calculateNutritionTargets } from '../lib/store';
import { FoodEntry, NutritionProfile, DayTotals } from '../types';
import { aiService } from '../services/aiService';
import { ArrowLeft, Sliders, Plus, Trash2, Sparkles, Flame, Check } from 'lucide-react';
import { LogFoodModal } from './LogFoodModal';
import { NutritionGoalModal } from './NutritionGoalModal';

interface NutritionDashboardProps {
  onBack: () => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<NutritionProfile>(store.getNutritionProfile());
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>(store.getTodayFoodEntries());
  const [totals, setTotals] = useState<DayTotals>(store.getTodayTotals());
  const [tip, setTip] = useState<string>('Pense à bien équilibrer tes sources de protéines tout au long de la journée.');

  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const refresh = () => {
    setProfile(store.getNutritionProfile());
    setTodayEntries(store.getTodayFoodEntries());
    setTotals(store.getTodayTotals());
  };

  useEffect(() => {
    const unsub = store.subscribe(refresh);
    return unsub;
  }, []);

  const targets = calculateNutritionTargets(profile);
  const kcalLeft = targets.kcal - totals.kcal;

  // Macro calorie ratios for segmented breakdown
  const proteinKcal = totals.proteinG * 4;
  const carbsKcal = totals.carbsG * 4;
  const fatKcal = totals.fatG * 9;
  const macroKcalTotal = proteinKcal + carbsKcal + fatKcal || 1;
  const proteinPct = Math.round((proteinKcal / macroKcalTotal) * 100);
  const carbsPct = Math.round((carbsKcal / macroKcalTotal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const handleFoodAdded = async (kcal: number, mealType: string) => {
    refresh();
    const newTip = await aiService.generateNutritionTip(
      mealType,
      kcal < 300 ? 'Léger' : kcal > 700 ? 'Copieux' : 'Normal',
      totals.kcal + kcal
    );
    setTip(newTip);
  };

  const handleDelete = (id: string) => {
    store.deleteFoodEntry(id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto pb-24 px-5 pt-6 sm:pt-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
              Piliers 01 · Nutrition
            </span>
            <h2 className="font-head text-[20px] font-bold text-[#F2F2F4]">
              Aujourd'hui
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowGoalModal(true)}
          className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#86868F] hover:text-[#C4ED4A] transition-colors"
          title="Configurer mes objectifs"
        >
          <Sliders size={18} />
        </button>
      </div>

      {/* Main Content */}
      {!profile.isSet ? (
        /* Setup goal banner */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#16161B] border border-white/10 rounded-[24px]">
          <div className="w-14 h-14 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 flex items-center justify-center text-[#C4ED4A] mb-4">
            <Flame size={28} />
          </div>
          <h3 className="font-head text-[20px] font-bold text-[#F2F2F4] mb-2">
            Définis ton objectif
          </h3>
          <p className="text-[13px] text-[#86868F] max-w-xs mb-6">
            Calcule automatiquement tes cibles quotidiennes de calories et de macronutriments.
          </p>
          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="py-3 px-6 rounded-[14px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[14px] hover:bg-[#b5dc3f] transition-all cursor-pointer"
          >
            Configurer mes cibles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Calorie Card */}
          <div className="p-5 rounded-[22px] bg-[#16161B] border border-white/8 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
                    Restant aujourd'hui
                  </span>
                  {totals.kcal > targets.kcal ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[9px] font-bold">
                      Surplus (+{totals.kcal - targets.kcal})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 text-[#C4ED4A] font-mono text-[9px] font-bold">
                      Déficit en cours
                    </span>
                  )}
                </div>
                <div className="font-mono text-[36px] font-bold text-[#F2F2F4] tracking-tight leading-tight">
                  {kcalLeft > 0 ? kcalLeft : 0}{' '}
                  <span className="text-[16px] text-[#86868F] font-normal">kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
                  Cible quotidienne
                </span>
                <div className="font-mono text-[19px] font-bold text-[#C4ED4A]">
                  {totals.kcal} <span className="text-white/40 text-[14px]">/ {targets.kcal}</span>
                </div>
              </div>
            </div>

            {/* Overall Kcal Progress Bar with Target Indicator */}
            <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  totals.kcal > targets.kcal ? 'bg-amber-400' : 'bg-[#C4ED4A]'
                }`}
                style={{
                  width: `${Math.min((totals.kcal / (targets.kcal || 1)) * 100, 100)}%`,
                }}
              />
            </div>

            {/* Segmented Macro Distribution Bar */}
            {totals.kcal > 0 && (
              <div className="mb-4 p-3 rounded-[16px] bg-[#1C1C22] border border-white/6">
                <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                  <span className="text-[#86868F] uppercase tracking-wider text-[9px] font-bold">
                    Répartition des calories réelles
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-blue-400 font-bold">{proteinPct}% P</span>
                    <span className="text-amber-400 font-bold">{carbsPct}% G</span>
                    <span className="text-rose-400 font-bold">{fatPct}% L</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5 gap-0.5">
                  <div
                    style={{ width: `${proteinPct}%` }}
                    className="h-full bg-blue-400 rounded-l-full transition-all duration-300"
                    title="Protéines"
                  />
                  <div
                    style={{ width: `${carbsPct}%` }}
                    className="h-full bg-amber-400 transition-all duration-300"
                    title="Glucides"
                  />
                  <div
                    style={{ width: `${fatPct}%` }}
                    className="h-full bg-rose-400 rounded-r-full transition-all duration-300"
                    title="Lipides"
                  />
                </div>
              </div>
            )}

            {/* Macro bars */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Protein */}
              <div className="p-3 rounded-[14px] bg-[#1C1C22] border border-white/6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-blue-400 font-bold">Protéines</span>
                    <span className="font-mono text-[10px] text-[#86868F]">
                      {Math.round((totals.proteinG / (targets.proteinG || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="font-mono text-[14px] font-bold text-white mb-2">
                    {totals.proteinG} <span className="text-[11px] text-[#86868F] font-normal">/ {targets.proteinG}g</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((totals.proteinG / (targets.proteinG || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-[14px] bg-[#1C1C22] border border-white/6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-amber-400 font-bold">Glucides</span>
                    <span className="font-mono text-[10px] text-[#86868F]">
                      {Math.round((totals.carbsG / (targets.carbsG || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="font-mono text-[14px] font-bold text-white mb-2">
                    {totals.carbsG} <span className="text-[11px] text-[#86868F] font-normal">/ {targets.carbsG}g</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((totals.carbsG / (targets.carbsG || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="p-3 rounded-[14px] bg-[#1C1C22] border border-white/6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-rose-400 font-bold">Lipides</span>
                    <span className="font-mono text-[10px] text-[#86868F]">
                      {Math.round((totals.fatG / (targets.fatG || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="font-mono text-[14px] font-bold text-white mb-2">
                    {totals.fatG} <span className="text-[11px] text-[#86868F] font-normal">/ {targets.fatG}g</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((totals.fatG / (targets.fatG || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Tip Banner */}
          <div className="p-3.5 rounded-[16px] bg-[#C4ED4A]/5 border border-[#C4ED4A]/25 flex items-start gap-3">
            <Sparkles size={16} className="text-[#C4ED4A] flex-shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-[#D8D8DE] leading-relaxed">
              {tip}
            </p>
          </div>

          {/* Logged items list */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-head text-[16px] font-bold text-[#F2F2F4]">
                Journal du jour ({todayEntries.length})
              </h3>
            </div>

            {todayEntries.length === 0 ? (
              <div className="p-8 text-center rounded-[18px] bg-[#16161B] border border-white/6 text-[#86868F]">
                <p className="text-[13px]">Rien d'enregistré aujourd'hui.</p>
                <p className="text-[11px] text-[#55555E] mt-1">
                  Clique sur Ajouter pour enregistrer un repas en 2 clics.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-[16px] bg-[#16161B] border border-white/7 flex items-center justify-between hover:border-white/15 transition-all"
                  >
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-[#86868F] tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block mb-1">
                        {entry.mealType}
                      </span>
                      <div className="font-head text-[14px] font-semibold text-white">
                        {entry.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#86868F] mt-0.5">
                        P: {entry.proteinG}g · G: {entry.carbsG}g · L: {entry.fatG}g
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="font-mono text-[15px] font-bold text-[#C4ED4A]">
                        {entry.kcal} kcal
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#55555E] hover:text-rose-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {profile.isSet && (
        <div className="fixed bottom-6 left-0 right-0 max-w-lg mx-auto px-5 z-20 pointer-events-none">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="pointer-events-auto ml-auto flex items-center gap-2 py-3.5 px-6 rounded-full bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[14px] shadow-2xl hover:bg-[#b5dc3f] active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Ajouter</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <LogFoodModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onAdded={handleFoodAdded}
      />
      <NutritionGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
      />
    </div>
  );
};
