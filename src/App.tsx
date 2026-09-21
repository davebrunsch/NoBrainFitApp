import React, { useState, useEffect } from 'react';
import { store } from './lib/store';
import { WorkoutPlan, Recipe, RecipeSuggestions } from './types';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NutritionDashboard } from './screens/NutritionDashboard';
import { TrainFlowScreen } from './screens/TrainFlowScreen';
import { RagTrainFlowScreen } from './screens/RagTrainFlowScreen';
import { TrainResultScreen } from './screens/TrainResultScreen';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { CustomGymWorkoutScreen } from './screens/CustomGymWorkoutScreen';
import { CookFlowScreen } from './screens/CookFlowScreen';
import { CookResultScreen } from './screens/CookResultScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen';
import { ShoppingListScreen } from './screens/ShoppingListScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type ScreenId =
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'nutrition'
  | 'train_flow'
  | 'train_rag'
  | 'train_custom_gym'
  | 'train_result'
  | 'train_active'
  | 'cook_flow'
  | 'cook_result'
  | 'recipe_detail'
  | 'shopping_list'
  | 'library'
  | 'settings';

export const App: React.FC = () => {
  const profile = store.getUserProfile();

  // Route state
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    return profile.completed ? 'home' : 'auth';
  });

  // Transient state between flows
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [planDuration, setPlanDuration] = useState<string>('30 min');
  const [planLocation, setPlanLocation] = useState<string>('Maison');

  const [currentRecipes, setCurrentRecipes] = useState<RecipeSuggestions | null>(null);
  const [cookEffort, setCookEffort] = useState<string>('Un peu');
  const [cookPortions, setCookPortions] = useState<string>('2 personnes');

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Sync profile changes
  useEffect(() => {
    const unsub = store.subscribe(() => {
      const p = store.getUserProfile();
      if (!p.completed && currentScreen !== 'auth' && currentScreen !== 'onboarding') {
        setCurrentScreen('auth');
      }
    });
    return unsub;
  }, [currentScreen]);

  // Screen routing handlers
  const handleAuthSuccess = () => {
    const p = store.getUserProfile();
    if (p.completed) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('onboarding');
    }
  };

  const handleWorkoutGenerated = (
    plan: WorkoutPlan,
    duration: string,
    location: string
  ) => {
    setCurrentPlan(plan);
    setPlanDuration(duration);
    setPlanLocation(location);
    setCurrentScreen('train_result');
  };

  const handleRecipesGenerated = (
    suggestions: RecipeSuggestions,
    effort: string,
    portions: string
  ) => {
    setCurrentRecipes(suggestions);
    setCookEffort(effort);
    setCookPortions(portions);
    setCurrentScreen('cook_result');
  };

  const handleStartActiveSession = (plan: WorkoutPlan) => {
    setCurrentPlan(plan);
    setCurrentScreen('train_active');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F2F2F4]">
      {currentScreen === 'auth' && (
        <AuthScreen onSuccess={handleAuthSuccess} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          onComplete={() => setCurrentScreen('home')}
          onCancel={() => setCurrentScreen('auth')}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          onOpenNutrition={() => setCurrentScreen('nutrition')}
          onOpenTrain={() => setCurrentScreen('train_flow')}
          onOpenRagTrain={() => setCurrentScreen('train_rag')}
          onOpenCustomGym={() => setCurrentScreen('train_custom_gym')}
          onOpenCook={() => setCurrentScreen('cook_flow')}
          onOpenLibrary={() => setCurrentScreen('library')}
          onOpenSettings={() => setCurrentScreen('settings')}
          onLaunchWorkout={handleWorkoutGenerated}
        />
      )}

      {currentScreen === 'nutrition' && (
        <NutritionDashboard onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'train_flow' && (
        <TrainFlowScreen
          onBack={() => setCurrentScreen('home')}
          onWorkoutGenerated={handleWorkoutGenerated}
          onOpenCustomGym={() => setCurrentScreen('train_custom_gym')}
        />
      )}

      {currentScreen === 'train_rag' && (
        <RagTrainFlowScreen
          onBack={() => setCurrentScreen('home')}
          onWorkoutGenerated={handleWorkoutGenerated}
        />
      )}

      {currentScreen === 'train_custom_gym' && (
        <CustomGymWorkoutScreen
          onBack={() => setCurrentScreen('home')}
          onStartSession={handleStartActiveSession}
          onSavedToLibrary={() => {}}
        />
      )}

      {currentScreen === 'train_result' && currentPlan && (
        <TrainResultScreen
          plan={currentPlan}
          duration={planDuration}
          location={planLocation}
          onBack={() => setCurrentScreen('home')}
          onStartSession={handleStartActiveSession}
        />
      )}

      {currentScreen === 'train_active' && currentPlan && (
        <ActiveWorkoutScreen
          plan={currentPlan}
          onFinish={() => setCurrentScreen('home')}
          onQuit={() => setCurrentScreen('train_result')}
        />
      )}

      {currentScreen === 'cook_flow' && (
        <CookFlowScreen
          onBack={() => setCurrentScreen('home')}
          onRecipesGenerated={handleRecipesGenerated}
        />
      )}

      {currentScreen === 'cook_result' && currentRecipes && (
        <CookResultScreen
          suggestions={currentRecipes}
          effort={cookEffort}
          portions={cookPortions}
          onBack={() => setCurrentScreen('home')}
          onSelectRecipe={(r) => {
            setSelectedRecipe(r);
            setCurrentScreen('recipe_detail');
          }}
          onOpenShoppingList={() => setCurrentScreen('shopping_list')}
        />
      )}

      {currentScreen === 'recipe_detail' && selectedRecipe && (
        <RecipeDetailScreen
          recipe={selectedRecipe}
          portions={cookPortions}
          onBack={() => setCurrentScreen('cook_result')}
          onCooked={() => {}}
        />
      )}

      {currentScreen === 'shopping_list' && (
        <ShoppingListScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'library' && (
        <LibraryScreen
          onBack={() => setCurrentScreen('home')}
          onOpenCustomGym={() => setCurrentScreen('train_custom_gym')}
          onLaunchSavedWorkout={(plan) => {
            setCurrentPlan(plan);
            setPlanDuration('30 min');
            setPlanLocation('Favori');
            setCurrentScreen('train_result');
          }}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onEditProfile={() => setCurrentScreen('onboarding')}
          onLogout={() => {
            store.logout();
            setCurrentScreen('auth');
          }}
        />
      )}
    </div>
  );
};

export default App;
