import React, { useState, useEffect } from 'react';
import { Recipe, RecipeDetail } from '../types';
import { aiService } from '../services/aiService';
import { store } from '../lib/store';
import { ArrowLeft, Clock, Flame, Check, Utensils, ShoppingCart } from 'lucide-react';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  portions: string;
  onBack: () => void;
  onCooked?: () => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  portions,
  onBack,
  onCooked,
}) => {
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);

  useEffect(() => {
    let active = true;
    aiService.generateRecipeDetail(recipe.name, portions).then((res) => {
      if (active) {
        setDetail(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [recipe.name, portions]);

  const handleLogCookedMeal = () => {
    store.addFoodEntry({
      name: recipe.name,
      mealType: 'Plat cuisiné',
      kcal: recipe.kcal,
      proteinG: recipe.protG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
    });
    setIsLogged(true);
    if (onCooked) onCooked();
    setTimeout(() => setIsLogged(false), 3000);
  };

  const handleAddIngredientsToShoppingList = () => {
    if (detail) {
      store.addShoppingItems(detail.ingredients);
      setIsAddedToList(true);
      setTimeout(() => setIsAddedToList(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#86868F] bg-[#16161B] px-3 py-1.5 rounded-full border border-white/8">
          <Clock size={13} />
          <span>{recipe.timeMin} min</span>
        </div>
      </div>

      {/* Recipe Title & Macros */}
      <div className="mb-6">
        <h2 className="font-head text-[24px] font-bold text-white mb-2 leading-tight">
          {recipe.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#86868F]">
          <span className="px-2.5 py-1 rounded-full bg-[#C4ED4A]/10 text-[#C4ED4A] border border-[#C4ED4A]/25 font-bold">
            {recipe.kcal} kcal
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white">
            P: {recipe.protG}g
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white">
            G: {recipe.carbsG}g
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white">
            L: {recipe.fatG}g
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-3 border-[#C4ED4A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#86868F]">
            Chargement des étapes de préparation…
          </p>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Ingredients list */}
          <div className="p-5 rounded-[20px] bg-[#16161B] border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-head text-[16px] font-bold text-white">
                Ingrédients ({detail.ingredients.length})
              </h3>
              <button
                type="button"
                onClick={handleAddIngredientsToShoppingList}
                className="text-[11px] font-mono text-[#C4ED4A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isAddedToList ? (
                  <>
                    <Check size={13} />
                    <span>Ajouté à la liste</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={13} />
                    <span>+ Liste de courses</span>
                  </>
                )}
              </button>
            </div>
            <ul className="space-y-2">
              {detail.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#D8D8DE]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4ED4A] mt-2 flex-shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation steps */}
          <div className="p-5 rounded-[20px] bg-[#16161B] border border-white/8">
            <h3 className="font-head text-[16px] font-bold text-white mb-3">
              Préparation express
            </h3>
            <ol className="space-y-3.5">
              {detail.steps.map((st, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-[#D8D8DE] leading-relaxed">
                  <span className="font-mono text-[11px] font-bold text-[#C4ED4A] bg-[#C4ED4A]/10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#C4ED4A]/25">
                    {i + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-6 left-0 right-0 max-w-lg mx-auto px-5 z-20">
        <button
          type="button"
          onClick={handleLogCookedMeal}
          className="w-full py-4 px-6 rounded-[16px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-xl"
        >
          {isLogged ? (
            <>
              <Check size={18} />
              <span>Enregistré dans ton journal du jour !</span>
            </>
          ) : (
            <>
              <Utensils size={18} />
              <span>J'ai cuisiné ça (+{recipe.kcal} kcal)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
