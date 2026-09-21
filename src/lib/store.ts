import {
  UserProfile,
  NutritionProfile,
  NutritionTargets,
  FoodEntry,
  DayTotals,
  WorkoutHistoryEntry,
  SavedWorkout,
  ShoppingItem,
  AiConfig,
  TrainingPrefs,
} from '../types';
import { LIFESTYLES, GOALS } from './brand';

// ── Default configurations ────────────────────────────────────────────────────

export const DEFAULT_USER_PROFILE: UserProfile = {
  completed: false,
  sex: 'male',
  age: 25,
  heightCm: 175,
  weightKg: 75,
  targetWeightKg: 0,
  level: 'beginner',
  lifestyle: 'light',
  goal: 'recomposition',
  daysPerWeek: 3,
  equipment: 'bodyweight',
  gymMember: false,
};

export const DEMO_USER_PROFILE: UserProfile = {
  completed: true,
  sex: 'male',
  age: 29,
  heightCm: 178,
  weightKg: 78,
  targetWeightKg: 72,
  level: 'intermediate',
  lifestyle: 'active',
  goal: 'recomposition',
  daysPerWeek: 4,
  equipment: 'dumbbells',
  gymMember: false,
};

export const DEFAULT_NUTRITION_PROFILE: NutritionProfile = {
  goal: 'maintain',
  weightKg: 75,
  isSet: false,
};

export const DEFAULT_AI_CONFIG: AiConfig = {
  backend: 'demo',
  claudeApiKey: '',
  geminiApiKey: '',
  serverBaseUrl: 'http://localhost:3000',
  serverToken: '',
  serverEmail: '',
  ollamaBaseUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3:latest',
};

export const DEFAULT_TRAINING_PREFS: TrainingPrefs = {
  defaultRestSec: 60,
  vibrate: true,
  sound: true,
};

// ── Calculations ─────────────────────────────────────────────────────────────

export function calculateBmi(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  if (m <= 0) return 0;
  return Number((weightKg / (m * m)).toFixed(1));
}

export function calculateBmr(profile: UserProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  const adj = profile.sex === 'male' ? base + 5 : base - 161;
  return Math.round(adj);
}

export function calculateTdee(profile: UserProfile): number {
  const bmr = calculateBmr(profile);
  const lifestyle = LIFESTYLES.find((l) => l.id === profile.lifestyle);
  const factor = lifestyle?.factor ?? 1.375;
  return Math.round(bmr * factor);
}

export function calculateDailyCalorieTarget(profile: UserProfile): number {
  const tdee = calculateTdee(profile);
  const goalObj = GOALS.find((g) => g.id === profile.goal);
  const delta = goalObj?.kcalDelta ?? 0;
  return Math.min(Math.max(tdee + delta, 1200), 5000);
}

export function calculateNutritionTargets(profile: NutritionProfile): NutritionTargets {
  const w = Math.min(Math.max(profile.weightKg, 30), 250);
  let kcalPerKg = 33.0;
  let protPerKg = 1.8;
  const fatPerKg = 0.9;

  if (profile.goal === 'lose') {
    kcalPerKg = 28.0;
    protPerKg = 2.0;
  } else if (profile.goal === 'gain') {
    kcalPerKg = 38.0;
    protPerKg = 2.0;
  }

  const kcal = Math.round(w * kcalPerKg);
  const prot = Math.round(w * protPerKg);
  const fat = Math.round(w * fatPerKg);
  const carbs = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));

  return { kcal, proteinG: prot, carbsG: carbs, fatG: fat };
}

// ── Storage Keys ──────────────────────────────────────────────────────────────

const KEYS = {
  USER_PROFILE: 'nobrainfit_profile',
  NUTRITION_PROFILE: 'nobrainfit_nutrition_profile',
  FOOD_ENTRIES: 'nobrainfit_food_entries',
  WORKOUT_HISTORY: 'nobrainfit_workout_history',
  SAVED_WORKOUTS: 'nobrainfit_saved_workouts',
  SHOPPING_LIST: 'nobrainfit_shopping_list',
  AI_CONFIG: 'nobrainfit_ai_config',
  TRAINING_PREFS: 'nobrainfit_training_prefs',
};

// ── Reactive Store Class ──────────────────────────────────────────────────────

type Listener = () => void;

class Store {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ── User Profile
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  setUserProfile(profile: UserProfile) {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    // If nutrition profile is not set, sync from user profile
    const nut = this.getNutritionProfile();
    if (!nut.isSet && profile.completed) {
      this.setNutritionProfile({
        goal: profile.goal === 'loseFat' ? 'lose' : profile.goal === 'buildMuscle' ? 'gain' : 'maintain',
        weightKg: profile.weightKg,
        isSet: true,
      });
    }
    this.notify();
  }

  // ── Nutrition Profile
  getNutritionProfile(): NutritionProfile {
    try {
      const data = localStorage.getItem(KEYS.NUTRITION_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_NUTRITION_PROFILE;
    } catch {
      return DEFAULT_NUTRITION_PROFILE;
    }
  }

  setNutritionProfile(profile: NutritionProfile) {
    localStorage.setItem(KEYS.NUTRITION_PROFILE, JSON.stringify(profile));
    this.notify();
  }

  // ── Food Entries
  getFoodEntries(): FoodEntry[] {
    try {
      const data = localStorage.getItem(KEYS.FOOD_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getTodayFoodEntries(): FoodEntry[] {
    const todayStr = new Date().toISOString().slice(0, 10);
    return this.getFoodEntries().filter((e) => e.loggedAt.slice(0, 10) === todayStr);
  }

  getTodayTotals(): DayTotals {
    const today = this.getTodayFoodEntries();
    return today.reduce<DayTotals>(
      (acc, cur) => ({
        kcal: acc.kcal + cur.kcal,
        proteinG: acc.proteinG + cur.proteinG,
        carbsG: acc.carbsG + cur.carbsG,
        fatG: acc.fatG + cur.fatG,
      }),
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  }

  addFoodEntry(entry: Omit<FoodEntry, 'id' | 'loggedAt'>) {
    const entries = this.getFoodEntries();
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      loggedAt: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    localStorage.setItem(KEYS.FOOD_ENTRIES, JSON.stringify(entries));
    this.notify();
    return newEntry;
  }

  deleteFoodEntry(id: string) {
    const entries = this.getFoodEntries().filter((e) => e.id !== id);
    localStorage.setItem(KEYS.FOOD_ENTRIES, JSON.stringify(entries));
    this.notify();
  }

  // ── Workout History
  getWorkoutHistory(): WorkoutHistoryEntry[] {
    try {
      const data = localStorage.getItem(KEYS.WORKOUT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addWorkoutHistory(entry: Omit<WorkoutHistoryEntry, 'id' | 'date'>) {
    const history = this.getWorkoutHistory();
    const newEntry: WorkoutHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    history.unshift(newEntry);
    localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    this.notify();
    return newEntry;
  }

  clearWorkoutHistory() {
    localStorage.removeItem(KEYS.WORKOUT_HISTORY);
    this.notify();
  }

  getStreak(): number {
    const history = this.getWorkoutHistory();
    if (history.length === 0) return 0;
    const days = new Set(history.map((e) => e.date.slice(0, 10)));
    const today = new Date();
    let current = new Date(today);
    let streak = 0;

    const currentStr = current.toISOString().slice(0, 10);
    if (!days.has(currentStr)) {
      current.setDate(current.getDate() - 1);
    }

    while (days.has(current.toISOString().slice(0, 10))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }

  isTrainedToday(): boolean {
    const todayStr = new Date().toISOString().slice(0, 10);
    return this.getWorkoutHistory().some((e) => e.date.slice(0, 10) === todayStr);
  }

  // ── Saved Workouts
  getSavedWorkouts(): SavedWorkout[] {
    try {
      const data = localStorage.getItem(KEYS.SAVED_WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSavedWorkout(workout: Omit<SavedWorkout, 'id' | 'savedAt'>) {
    const saved = this.getSavedWorkouts();
    const newSaved: SavedWorkout = {
      ...workout,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };
    saved.unshift(newSaved);
    localStorage.setItem(KEYS.SAVED_WORKOUTS, JSON.stringify(saved));
    this.notify();
    return newSaved;
  }

  deleteSavedWorkout(id: string) {
    const saved = this.getSavedWorkouts().filter((w) => w.id !== id);
    localStorage.setItem(KEYS.SAVED_WORKOUTS, JSON.stringify(saved));
    this.notify();
  }

  // ── Shopping List
  getShoppingList(): ShoppingItem[] {
    try {
      const data = localStorage.getItem(KEYS.SHOPPING_LIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addShoppingItems(items: string[]): number {
    const current = this.getShoppingList();
    const currentLabels = new Set(current.map((i) => i.label.toLowerCase()));
    let addedCount = 0;

    const toAdd: ShoppingItem[] = [];
    for (const item of items) {
      if (!currentLabels.has(item.toLowerCase())) {
        toAdd.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          label: item,
          checked: false,
        });
        currentLabels.add(item.toLowerCase());
        addedCount++;
      }
    }

    if (toAdd.length > 0) {
      const updated = [...current, ...toAdd];
      localStorage.setItem(KEYS.SHOPPING_LIST, JSON.stringify(updated));
      this.notify();
    }
    return addedCount;
  }

  toggleShoppingItem(id: string) {
    const current = this.getShoppingList().map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    localStorage.setItem(KEYS.SHOPPING_LIST, JSON.stringify(current));
    this.notify();
  }

  removeCheckedShoppingItems() {
    const current = this.getShoppingList().filter((i) => !i.checked);
    localStorage.setItem(KEYS.SHOPPING_LIST, JSON.stringify(current));
    this.notify();
  }

  clearShoppingList() {
    localStorage.removeItem(KEYS.SHOPPING_LIST);
    this.notify();
  }

  // ── AI Config
  getAiConfig(): AiConfig {
    try {
      const data = localStorage.getItem(KEYS.AI_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_AI_CONFIG;
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  }

  setAiConfig(config: AiConfig) {
    localStorage.setItem(KEYS.AI_CONFIG, JSON.stringify(config));
    this.notify();
  }

  // ── Training Prefs
  getTrainingPrefs(): TrainingPrefs {
    try {
      const data = localStorage.getItem(KEYS.TRAINING_PREFS);
      return data ? JSON.parse(data) : DEFAULT_TRAINING_PREFS;
    } catch {
      return DEFAULT_TRAINING_PREFS;
    }
  }

  setTrainingPrefs(prefs: TrainingPrefs) {
    localStorage.setItem(KEYS.TRAINING_PREFS, JSON.stringify(prefs));
    this.notify();
  }

  // ── Demo Mode helpers
  enterDemoMode() {
    this.setUserProfile(DEMO_USER_PROFILE);
    this.setAiConfig({
      ...this.getAiConfig(),
      backend: 'demo',
    });

    // Seed initial food entries if empty
    if (this.getFoodEntries().length === 0) {
      this.addFoodEntry({
        name: 'Omelette 3 œufs & pain complet',
        mealType: 'Petit-déjeuner',
        kcal: 420,
        proteinG: 28,
        carbsG: 32,
        fatG: 18,
      });
      this.addFoodEntry({
        name: 'Poulet grillé, riz basmati & brocolis',
        mealType: 'Déjeuner',
        kcal: 650,
        proteinG: 48,
        carbsG: 65,
        fatG: 14,
      });
    }

    // Seed initial workout history if empty
    if (this.getWorkoutHistory().length === 0) {
      this.addWorkoutHistory({
        title: 'Full Body · 30 min (Salle)',
        type: 'Classique',
        durationSec: 1840,
        exercisesCount: 5,
        setsCompleted: 15,
      });
    }

    // Seed shopping list if empty
    if (this.getShoppingList().length === 0) {
      this.addShoppingItems([
        'Blanc de poulet · 400 g',
        'Riz basmati · 500 g',
        'Brocolis frais · 1 tête',
        'Huile d\'olive vierge',
      ]);
    }
  }

  logout() {
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.AI_CONFIG);
    this.notify();
  }
}

export const store = new Store();
