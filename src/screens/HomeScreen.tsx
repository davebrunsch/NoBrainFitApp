import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { StatStrip } from '../components/StatStrip';
import { ActionRow } from '../components/ActionRow';
import { store } from '../lib/store';
import { WorkoutPlan } from '../types';
import { Utensils, Dumbbell, ChefHat, Zap, Building2, Trees } from 'lucide-react';
import { aiService } from '../services/aiService';

interface HomeScreenProps {
  onOpenNutrition: () => void;
  onOpenTrain: () => void;
  onOpenRagTrain: () => void;
  onOpenCustomGym: () => void;
  onOpenCook: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onLaunchWorkout: (plan: WorkoutPlan, duration: string, location: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenNutrition,
  onOpenTrain,
  onOpenRagTrain,
  onOpenCustomGym,
  onOpenCook,
  onOpenLibrary,
  onOpenSettings,
  onLaunchWorkout,
}) => {
  const [totals, setTotals] = useState(store.getTodayTotals());
  const [streak, setStreak] = useState(store.getStreak());
  const [trainedToday, setTrainedToday] = useState(store.isTrainedToday());

  const refresh = () => {
    setTotals(store.getTodayTotals());
    setStreak(store.getStreak());
    setTrainedToday(store.isTrainedToday());
  };

  useEffect(() => {
    const unsub = store.subscribe(refresh);
    return unsub;
  }, []);

  // Format date like Flutter: "MERCREDI 24 SEPT."
  const now = new Date();
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
  const dateLabel = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`.toUpperCase();

  const handleQuickWorkout = async (duration: string, location: string) => {
    const plan = await aiService.generateWorkout(duration, location);
    onLaunchWorkout(plan, duration, location);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-5 sm:py-6 flex flex-col justify-between pb-8">
      <div>
        {/* Top bar with wordmark & library/profile icons */}
        <TopBar
          onGoHome={() => {}}
          onOpenLibrary={onOpenLibrary}
          onOpenSettings={onOpenSettings}
        />

        {/* Hero date & title */}
        <div className="mt-6 mb-5">
          <div className="font-mono text-[11px] uppercase font-bold tracking-widest text-[#86868F] mb-1.5">
            {dateLabel}
          </div>
          <h1 className="font-head text-[34px] sm:text-[38px] font-semibold tracking-[-0.03em] leading-[1.05]">
            <span className="text-[#F2F2F4] block">On fait quoi</span>
            <span className="text-[#55555E]">aujourd'hui ?</span>
          </h1>
        </div>

        {/* Stat strip (Kcal, Séance, Streak) */}
        <div className="mb-5">
          <StatStrip
            kcal={totals.kcal}
            trainedToday={trainedToday}
            streak={streak}
            onClickKcal={onOpenNutrition}
            onClickWorkout={onOpenTrain}
            onClickStreak={onOpenLibrary}
          />
        </div>

        {/* The 3 Core Action Rows */}
        <div className="space-y-3">
          {/* 01 Manger */}
          <ActionRow
            index="01"
            icon={Utensils}
            kicker="Nutrition"
            title="Manger"
            sub="Suivi des calories & macros"
            onNavigate={onOpenNutrition}
          />

          {/* 02 S'entraîner */}
          <ActionRow
            index="02"
            icon={Dumbbell}
            kicker="Training"
            title="S'entraîner"
            sub="Glisse pour le programme IA · ou choisir"
            onNavigate={onOpenRagTrain}
            customAction={{
              label: 'Créer séance salle sur-mesure',
              onClick: onOpenCustomGym,
            }}
            quickPicks={[
              {
                icon: Zap,
                label: '15 min · Maison',
                sub: 'Express · Sans matériel',
                onSelect: () => handleQuickWorkout('15 min', 'Maison'),
              },
              {
                icon: Building2,
                label: '30 min · Salle',
                sub: 'Standard · Avec machines',
                onSelect: () => handleQuickWorkout('30 min', 'Salle'),
              },
              {
                icon: Trees,
                label: '45 min · Dehors',
                sub: 'Complet · Parc, calisthénie…',
                onSelect: () => handleQuickWorkout('45 min', 'Dehors'),
              },
            ]}
          />

          {/* 03 Cuisiner */}
          <ActionRow
            index="03"
            icon={ChefHat}
            kicker="Cuisine"
            title="Cuisiner"
            sub="3 recettes + liste de courses"
            onNavigate={onOpenCook}
          />
        </div>
      </div>

      {/* Radical simplicity footer */}
      <div className="pt-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#2A2A32]">
          NoBrainFit · Zéro réflexion · Résultat immédiat
        </p>
      </div>
    </div>
  );
};
