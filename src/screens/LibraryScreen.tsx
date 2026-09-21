import React, { useState, useEffect } from 'react';
import { store } from '../lib/store';
import { WorkoutHistoryEntry, SavedWorkout, WorkoutPlan } from '../types';
import { ArrowLeft, Bookmark, History, Play, Trash2, Dumbbell, Clock, Plus } from 'lucide-react';

interface LibraryScreenProps {
  onBack: () => void;
  onLaunchSavedWorkout: (plan: WorkoutPlan) => void;
  onOpenCustomGym?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onBack,
  onLaunchSavedWorkout,
  onOpenCustomGym,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>(store.getWorkoutHistory());
  const [favorites, setFavorites] = useState<SavedWorkout[]>(store.getSavedWorkouts());

  const refresh = () => {
    setHistory(store.getWorkoutHistory());
    setFavorites(store.getSavedWorkouts());
  };

  useEffect(() => {
    const unsub = store.subscribe(refresh);
    return unsub;
  }, []);

  const handleDeleteFavorite = (id: string) => {
    store.deleteSavedWorkout(id);
    refresh();
  };

  const handleClearHistory = () => {
    if (confirm('Effacer tout l\'historique des entraînements ?')) {
      store.clearWorkoutHistory();
      refresh();
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    return `${m} min`;
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
          {activeTab === 'history' && history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[11px] font-mono text-[#86868F] hover:text-rose-400"
            >
              Effacer historique
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C4ED4A]">
            Suivi & Programmes
          </span>
          <h2 className="font-head text-[24px] font-bold text-[#F2F2F4]">
            Bibliothèque
          </h2>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-[14px] bg-[#16161B] border border-white/8 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 rounded-[10px] font-head text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-[#1C1C22] text-[#C4ED4A] shadow-sm border border-white/8'
                : 'text-[#86868F] hover:text-white'
            }`}
          >
            <History size={15} />
            <span>Historique ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`py-2.5 rounded-[10px] font-head text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#1C1C22] text-[#C4ED4A] shadow-sm border border-white/8'
                : 'text-[#86868F] hover:text-white'
            }`}
          >
            <Bookmark size={15} />
            <span>Favoris ({favorites.length})</span>
          </button>
        </div>

        {/* Content: History Tab */}
        {activeTab === 'history' && (
          <div>
            {history.length === 0 ? (
              <div className="p-12 text-center rounded-[20px] bg-[#16161B] border border-white/6 text-[#86868F]">
                <Dumbbell size={36} className="mx-auto mb-3 text-[#55555E]" />
                <p className="font-head text-[16px] font-bold text-white mb-1">
                  Aucune séance enregistrée
                </p>
                <p className="text-[12px] text-[#86868F]">
                  Termine ta première séance guidée pour la voir apparaître ici.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-[16px] bg-[#16161B] border border-white/7 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase font-bold text-[#C4ED4A] px-2 py-0.5 rounded bg-[#C4ED4A]/10 border border-[#C4ED4A]/25">
                          {entry.type}
                        </span>
                        <span className="font-mono text-[10px] text-[#86868F]">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <h4 className="font-head text-[15px] font-bold text-white">
                        {entry.title}
                      </h4>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-[#86868F] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(entry.durationSec)}
                        </span>
                        <span>·</span>
                        <span>{entry.exercisesCount} exercices</span>
                        <span>·</span>
                        <span>{entry.setsCompleted} séries</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content: Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            {onOpenCustomGym && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={onOpenCustomGym}
                  className="w-full py-3 px-4 rounded-[16px] bg-[#16161B] border border-[#C4ED4A]/30 hover:border-[#C4ED4A]/60 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 flex items-center justify-center text-[#C4ED4A]">
                      <Plus size={16} />
                    </div>
                    <div>
                      <span className="font-head text-[14px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors block">
                        Créer une séance salle sur-mesure
                      </span>
                      <span className="text-[11px] text-[#86868F]">
                        Choisis tes exercices, séries et repos
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#C4ED4A] font-bold">
                    Atelier →
                  </span>
                </button>
              </div>
            )}

            {favorites.length === 0 ? (
              <div className="p-12 text-center rounded-[20px] bg-[#16161B] border border-white/6 text-[#86868F]">
                <Bookmark size={36} className="mx-auto mb-3 text-[#55555E]" />
                <p className="font-head text-[16px] font-bold text-white mb-1">
                  Aucun favori sauvegardé
                </p>
                <p className="text-[12px] text-[#86868F]">
                  Génère un entraînement ou crée ta séance salle personnalisée.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-4 rounded-[18px] bg-[#16161B] border border-white/8 hover:border-white/18 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-mono text-[9px] uppercase font-bold text-[#86868F] px-2 py-0.5 rounded bg-white/5 border border-white/5 inline-block mb-1">
                          {fav.type}
                        </span>
                        <h4 className="font-head text-[16px] font-bold text-white">
                          {fav.title}
                        </h4>
                        <div className="text-[12px] text-[#86868F] mt-0.5">
                          {fav.exercises.length} exercices enregistrés
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteFavorite(fav.id)}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#55555E] hover:text-rose-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onLaunchSavedWorkout({
                          title: fav.title,
                          exercises: fav.exercises,
                        })
                      }
                      className="w-full mt-3 py-2.5 px-4 rounded-[12px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] transition-all cursor-pointer"
                    >
                      <Play size={14} fill="#0B0B0F" />
                      <span>Lancer cette séance</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
