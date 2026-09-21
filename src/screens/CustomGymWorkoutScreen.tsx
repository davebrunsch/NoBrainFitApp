import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Play,
  Bookmark,
  BookmarkCheck,
  Search,
  Sliders,
  Check,
  Sparkles,
  Layers,
  X,
  Clock,
  Flame,
} from 'lucide-react';
import { WorkoutPlan, Exercise } from '../types';
import { store } from '../lib/store';
import {
  GYM_EXERCISES_CATALOG,
  GYM_SPLIT_PRESETS,
  GymExerciseDef,
  MuscleCategory,
  GymEquipmentType,
  convertDefToExercise,
} from '../data/gymExercises';

interface CustomGymWorkoutScreenProps {
  onBack: () => void;
  onStartSession: (plan: WorkoutPlan) => void;
  onSavedToLibrary?: () => void;
}

interface CustomItem {
  id: string;
  name: string;
  equipment: GymEquipmentType;
  muscles: string;
  sets: number;
  reps: string;
  restSec: number;
  cue?: string;
}

export const CustomGymWorkoutScreen: React.FC<CustomGymWorkoutScreenProps> = ({
  onBack,
  onStartSession,
  onSavedToLibrary,
}) => {
  // Initial plan defaults to Push
  const defaultPreset = GYM_SPLIT_PRESETS[0];

  const [title, setTitle] = useState<string>(defaultPreset.name);
  const [selectedDuration, setSelectedDuration] = useState<string>('45 min');
  const [targetGoal, setTargetGoal] = useState<'hypertrophy' | 'strength' | 'pump'>('hypertrophy');

  // Exercise items list
  const [items, setItems] = useState<CustomItem[]>(() => {
    return defaultPreset.exerciseIds
      .map((id) => GYM_EXERCISES_CATALOG.find((e) => e.id === id))
      .filter((e): e is GymExerciseDef => !!e)
      .map((def) => ({
        id: `${def.id}_${Date.now()}_${Math.random()}`,
        name: def.name,
        equipment: def.equipment,
        muscles: def.muscles,
        sets: def.defaultSets,
        reps: def.defaultReps,
        restSec: def.defaultRestSec,
        cue: def.cue,
      }));
  });

  // Modals
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Exercise picker filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  // Custom free exercise creation within picker
  const [customExerciseName, setCustomExerciseName] = useState<string>('');

  // Load a preset
  const handleLoadPreset = (presetId: string) => {
    const p = GYM_SPLIT_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setTitle(p.name);
    const newItems: CustomItem[] = p.exerciseIds
      .map((id) => GYM_EXERCISES_CATALOG.find((e) => e.id === id))
      .filter((e): e is GymExerciseDef => !!e)
      .map((def) => ({
        id: `${def.id}_${Date.now()}_${Math.random()}`,
        name: def.name,
        equipment: def.equipment,
        muscles: def.muscles,
        sets: targetGoal === 'strength' ? 4 : def.defaultSets,
        reps:
          targetGoal === 'strength'
            ? '5-6 reps'
            : targetGoal === 'pump'
            ? '12-15 reps'
            : def.defaultReps,
        restSec:
          targetGoal === 'strength'
            ? 120
            : targetGoal === 'pump'
            ? 45
            : def.defaultRestSec,
        cue: def.cue,
      }));
    setItems(newItems);
  };

  // Reorder items
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setItems(next);
  };

  // Delete item
  const handleDelete = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  // Add from catalog
  const handleAddFromCatalog = (def: GymExerciseDef) => {
    const newItem: CustomItem = {
      id: `${def.id}_${Date.now()}`,
      name: def.name,
      equipment: def.equipment,
      muscles: def.muscles,
      sets: def.defaultSets,
      reps: def.defaultReps,
      restSec: def.defaultRestSec,
      cue: def.cue,
    };
    setItems([...items, newItem]);
    setShowPicker(false);
  };

  // Add custom manual exercise
  const handleAddManualCustom = () => {
    if (!customExerciseName.trim()) return;
    const newItem: CustomItem = {
      id: `custom_${Date.now()}`,
      name: customExerciseName.trim(),
      equipment: 'machines',
      muscles: 'Muscles ciblés',
      sets: 3,
      reps: '10-12 reps',
      restSec: 60,
      cue: 'Exécution propre et contrôlée',
    };
    setItems([...items, newItem]);
    setCustomExerciseName('');
    setShowPicker(false);
  };

  // Update item config
  const handleUpdateItem = (
    id: string,
    updates: Partial<Pick<CustomItem, 'sets' | 'reps' | 'restSec'>>
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  // Build the WorkoutPlan
  const buildPlan = (): WorkoutPlan => {
    return {
      title: title.trim() || 'Séance Salle Personnalisée',
      exercises: items.map((it) => ({
        name: it.name,
        detail: `${it.sets} × ${it.reps} · ${it.restSec} s repos`,
      })),
    };
  };

  // Start active workout
  const handleLaunch = () => {
    if (items.length === 0) return;
    const plan = buildPlan();
    onStartSession(plan);
  };

  // Save to Favorites
  const handleSaveFavorite = () => {
    if (items.length === 0) return;
    const plan = buildPlan();
    store.addSavedWorkout({
      title: plan.title,
      type: 'Salle',
      exercises: plan.exercises,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    if (onSavedToLibrary) {
      onSavedToLibrary();
    }
  };

  // Equipment label helper
  const getEquipmentBadge = (eq: GymEquipmentType) => {
    switch (eq) {
      case 'barbell':
        return { label: 'Barre', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'dumbbells':
        return { label: 'Haltères', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'cables':
        return { label: 'Poulies', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'machines':
        return { label: 'Machine', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'bodyweight':
        return { label: 'Poids de corps', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default:
        return { label: 'Salle', bg: 'bg-white/5 text-white/60 border-white/10' };
    }
  };

  // Filtered catalog
  const filteredCatalog = GYM_EXERCISES_CATALOG.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscles.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === 'all' ||
      (categoryFilter === 'push' && ex.category === 'push') ||
      (categoryFilter === 'pull' && ex.category === 'pull') ||
      (categoryFilter === 'legs' && ex.category === 'legs') ||
      (categoryFilter === 'arms' && ex.category === 'arms') ||
      (categoryFilter === 'core' && ex.category === 'core');
    const matchesEq = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
    return matchesSearch && matchesCat && matchesEq;
  });

  const totalSets = items.reduce((acc, it) => acc + it.sets, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between pb-32">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <Dumbbell size={16} className="text-[#C4ED4A]" />
            <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
              Atelier Salle de Musculation
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveFavorite}
            disabled={items.length === 0}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#86868F] hover:text-[#C4ED4A] transition-colors cursor-pointer disabled:opacity-40"
            title="Sauvegarder dans mes favoris"
          >
            {isSaved ? (
              <BookmarkCheck size={18} className="text-[#C4ED4A]" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        </div>

        {/* Title and Summary */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C4ED4A]/10 text-[#C4ED4A] border border-[#C4ED4A]/25">
              100% Modulable
            </span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
              Salle de sport
            </span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de ta séance (ex: Push Day Force)"
            className="w-full bg-transparent font-head text-[24px] sm:text-[26px] font-bold text-[#F2F2F4] focus:outline-none border-b border-transparent focus:border-[#C4ED4A]/50 pb-1"
          />
        </div>

        {/* Split Preset Quick Chips */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold">
              Modèles de split (chargement en 1 clic)
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {GYM_SPLIT_PRESETS.map((preset) => {
              const isActive = title.startsWith(preset.name.split(' ')[0]);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#C4ED4A]/15 border-[#C4ED4A]/40 text-[#C4ED4A] font-bold'
                      : 'bg-[#16161B] border-white/8 text-[#86868F] hover:text-white hover:border-white/20'
                  }`}
                >
                  {preset.name.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Telemetry Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-[16px] bg-[#16161B] border border-white/8 mb-6 font-mono text-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#86868F] block">
              Exercices
            </span>
            <span className="text-[17px] font-bold text-white">
              {items.length}
            </span>
          </div>
          <div className="border-x border-white/8">
            <span className="text-[10px] uppercase tracking-wider text-[#86868F] block">
              Séries totales
            </span>
            <span className="text-[17px] font-bold text-[#C4ED4A]">
              {totalSets}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#86868F] block">
              Format estimé
            </span>
            <span className="text-[17px] font-bold text-white">
              ~{Math.round(totalSets * 2.5)}m
            </span>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#86868F] font-bold">
              Exercices de la séance ({items.length})
            </span>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1 text-[12px] font-mono font-bold text-[#C4ED4A] hover:underline cursor-pointer"
            >
              <Plus size={14} />
              <span>Ajouter un exercice</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center rounded-[18px] bg-[#16161B] border border-dashed border-white/10 text-[#86868F]">
              <Dumbbell size={32} className="mx-auto mb-2 text-[#55555E]" />
              <p className="font-head text-[15px] font-bold text-white mb-1">
                Aucun exercice sélectionné
              </p>
              <p className="text-[12px] text-[#86868F] mb-4">
                Choisis un modèle de split ci-dessus ou ajoute tes mouvements favoris.
              </p>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="px-4 py-2 rounded-[12px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[13px] hover:bg-[#b5dc3f] transition-all cursor-pointer"
              >
                Ouvrir le catalogue d'exercices
              </button>
            </div>
          ) : (
            items.map((item, index) => {
              const badge = getEquipmentBadge(item.equipment);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-[18px] bg-[#16161B] border border-white/8 hover:border-white/14 transition-all overflow-hidden"
                >
                  <div className="p-3.5 sm:p-4 flex items-start gap-3">
                    {/* Index */}
                    <div className="w-7 h-7 rounded-[10px] bg-[#1C1C22] border border-white/8 flex items-center justify-center font-mono text-[12px] font-bold text-[#C4ED4A] flex-shrink-0 mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-[#86868F] truncate">
                          {item.muscles}
                        </span>
                      </div>

                      <h4 className="font-head text-[16px] font-bold text-white leading-tight mb-1">
                        {item.name}
                      </h4>

                      <div className="font-mono text-[12px] text-[#C4ED4A]">
                        {item.sets} séries × {item.reps} · {item.restSec} s repos
                      </div>

                      {item.cue && (
                        <p className="text-[11px] text-[#86868F] mt-1 line-clamp-1 italic">
                          "{item.cue}"
                        </p>
                      )}
                    </div>

                    {/* Quick controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItemId(isEditing ? null : item.id)
                        }
                        className={`w-8 h-8 rounded-[10px] border flex items-center justify-center transition-colors cursor-pointer ${
                          isEditing
                            ? 'bg-[#C4ED4A]/20 border-[#C4ED4A]/40 text-[#C4ED4A]'
                            : 'bg-[#1C1C22] border-white/8 text-[#86868F] hover:text-white'
                        }`}
                        title="Régler séries et repos"
                      >
                        <Sliders size={14} />
                      </button>

                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="w-6 h-4 rounded bg-[#1C1C22] border border-white/6 flex items-center justify-center text-[#86868F] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === items.length - 1}
                          className="w-6 h-4 rounded bg-[#1C1C22] border border-white/6 flex items-center justify-center text-[#86868F] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-[10px] bg-[#1C1C22] border border-white/8 flex items-center justify-center text-[#86868F] hover:text-rose-400 hover:border-rose-400/30 transition-colors cursor-pointer ml-1"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Editor Drawer */}
                  {isEditing && (
                    <div className="p-3.5 bg-[#1C1C22] border-t border-white/8 space-y-3">
                      {/* Sets stepper */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#86868F]">
                          Nombre de séries :
                        </span>
                        <div className="flex items-center gap-2">
                          {[2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, { sets: s })
                              }
                              className={`w-7 h-7 rounded-[8px] font-mono text-[12px] font-bold border transition-colors cursor-pointer ${
                                item.sets === s
                                  ? 'bg-[#C4ED4A] text-[#0B0B0F] border-[#C4ED4A]'
                                  : 'bg-[#16161B] text-[#86868F] border-white/10 hover:text-white'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reps options */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#86868F]">
                          Cible de reps :
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['5-6 reps', '8-10 reps', '10-12 reps', '12-15 reps'].map(
                            (r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() =>
                                  handleUpdateItem(item.id, { reps: r })
                                }
                                className={`px-2 py-1 rounded-[8px] font-mono text-[10px] border transition-colors cursor-pointer ${
                                  item.reps === r
                                    ? 'bg-[#C4ED4A] text-[#0B0B0F] border-[#C4ED4A] font-bold'
                                    : 'bg-[#16161B] text-[#86868F] border-white/10 hover:text-white'
                                }`}
                              >
                                {r}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Rest time */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#86868F]">
                          Temps de repos :
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[45, 60, 75, 90, 120].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, { restSec: sec })
                              }
                              className={`px-2 py-1 rounded-[8px] font-mono text-[10px] border transition-colors cursor-pointer ${
                                item.restSec === sec
                                  ? 'bg-[#C4ED4A] text-[#0B0B0F] border-[#C4ED4A] font-bold'
                                  : 'bg-[#16161B] text-[#86868F] border-white/10 hover:text-white'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Bottom Launch & Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0F]/95 backdrop-blur-md border-t border-white/8 p-4 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveFavorite}
            disabled={items.length === 0}
            className="p-3.5 rounded-[16px] bg-[#16161B] border border-white/12 text-[#86868F] hover:text-[#C4ED4A] hover:border-[#C4ED4A]/40 transition-all cursor-pointer disabled:opacity-30"
            title="Sauvegarder dans mes favoris"
          >
            {isSaved ? (
              <BookmarkCheck size={20} className="text-[#C4ED4A]" />
            ) : (
              <Bookmark size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={items.length === 0}
            className="flex-1 py-3.5 px-6 rounded-[16px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_20px_rgba(196,237,74,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={18} fill="#0B0B0F" />
            <span>Démarrer à la salle ({items.length} exos)</span>
          </button>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#16161B] border border-white/10 rounded-t-[28px] sm:rounded-[28px] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C4ED4A]">
                  Bibliothèque Salle
                </span>
                <h3 className="font-head text-[19px] font-bold text-white">
                  Ajouter un exercice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="w-9 h-9 rounded-full bg-[#1C1C22] border border-white/10 flex items-center justify-center text-[#86868F] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-white/6 space-y-3 bg-[#131317]">
              {/* Search input */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868F]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher (ex: couché, squat, curl, poulie...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#1C1C22] border border-white/10 text-[13px] text-white focus:outline-none focus:border-[#C4ED4A]/60"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'push', label: 'Pectoraux & Épaules' },
                  { id: 'pull', label: 'Dos & Biceps' },
                  { id: 'legs', label: 'Jambes' },
                  { id: 'arms', label: 'Bras' },
                  { id: 'core', label: 'Abdos' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryFilter(c.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer border ${
                      categoryFilter === c.id
                        ? 'bg-[#C4ED4A] text-[#0B0B0F] border-[#C4ED4A] font-bold'
                        : 'bg-[#1C1C22] text-[#86868F] border-white/6 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Equipment pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tout matériel' },
                  { id: 'barbell', label: 'Barres' },
                  { id: 'dumbbells', label: 'Haltères' },
                  { id: 'cables', label: 'Poulies' },
                  { id: 'machines', label: 'Machines' },
                ].map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => setEquipmentFilter(eq.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer border ${
                      equipmentFilter === eq.id
                        ? 'bg-white/20 text-white border-white/40 font-bold'
                        : 'bg-[#1C1C22] text-[#86868F] border-white/6 hover:text-white'
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[45vh]">
              {filteredCatalog.length === 0 ? (
                <div className="py-8 text-center text-[#86868F]">
                  <p className="text-[13px]">Aucun exercice trouvé.</p>
                </div>
              ) : (
                filteredCatalog.map((def) => {
                  const badge = getEquipmentBadge(def.equipment);
                  const isAlreadyAdded = items.some(
                    (it) => it.name === def.name
                  );

                  return (
                    <div
                      key={def.id}
                      className="p-3.5 rounded-[14px] bg-[#1C1C22] border border-white/6 hover:border-white/12 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-[#86868F] truncate">
                            {def.muscles}
                          </span>
                        </div>
                        <h4 className="font-head text-[15px] font-bold text-white truncate">
                          {def.name}
                        </h4>
                        <div className="font-mono text-[11px] text-[#86868F] mt-0.5">
                          {def.defaultSets} séries · {def.defaultReps}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddFromCatalog(def)}
                        className={`px-3 py-1.5 rounded-[10px] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          isAlreadyAdded
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-[#C4ED4A] text-[#0B0B0F] hover:bg-[#b5dc3f]'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check size={13} />
                            <span>Ajouté</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Ajouter</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}

              {/* Free Custom Exercise Creator */}
              <div className="pt-3 border-t border-white/8 mt-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold block mb-2">
                  Ou ajouter un exercice personnalisé libre :
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="Nom personnalisé (ex: Hip Thrust machine)"
                    className="flex-1 px-3.5 py-2 rounded-[10px] bg-[#16161B] border border-white/10 text-[12px] text-white focus:outline-none focus:border-[#C4ED4A]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualCustom}
                    disabled={!customExerciseName.trim()}
                    className="px-3 py-2 rounded-[10px] bg-[#C4ED4A] text-[#0B0B0F] font-mono text-[11px] font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
