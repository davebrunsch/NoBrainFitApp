export type Sex = 'male' | 'female';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Lifestyle = 'sedentary' | 'light' | 'active' | 'veryActive';
export type Goal = 'loseFat' | 'buildMuscle' | 'recomposition' | 'maintain' | 'performance';
export type Equipment = 'bodyweight' | 'dumbbells' | 'machines' | 'fullGym';

export interface UserProfile {
  completed: boolean;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  level: FitnessLevel;
  lifestyle: Lifestyle;
  goal: Goal;
  daysPerWeek: number;
  equipment: Equipment;
  gymMember: boolean;
}

export type NutritionGoal = 'lose' | 'maintain' | 'gain';

export interface NutritionTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface NutritionProfile {
  goal: NutritionGoal;
  weightKg: number;
  isSet: boolean;
}

export interface FoodEntry {
  id: string;
  name: string;
  mealType: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string; // ISO string
}

export interface DayTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Exercise {
  name: string;
  detail: string;
}

export interface WorkoutPlan {
  title: string;
  exercises: Exercise[];
}

export interface Recipe {
  name: string;
  timeMin: number;
  kcal: number;
  protG: number;
  carbsG: number;
  fatG: number;
}

export interface RecipeSuggestions {
  recipes: Recipe[];
  shoppingList: string[];
}

export interface RecipeDetail {
  ingredients: string[];
  steps: string[];
}

export interface FoodEstimate {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface WorkoutHistoryEntry {
  id: string;
  title: string;
  type: string;
  date: string; // ISO string
  durationSec: number;
  exercisesCount: number;
  setsCompleted: number;
}

export interface SavedWorkout {
  id: string;
  title: string;
  type: string;
  savedAt: string;
  exercises: Exercise[];
}

export interface ShoppingItem {
  id: string;
  label: string;
  checked: boolean;
}

export type AiBackend = 'demo' | 'server' | 'claude' | 'ollama' | 'gemini';

export interface AiConfig {
  backend: AiBackend;
  claudeApiKey: string;
  geminiApiKey: string;
  serverBaseUrl: string;
  serverToken: string;
  serverEmail: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
}

export interface TrainingPrefs {
  defaultRestSec: number;
  vibrate: boolean;
  sound: boolean;
}
