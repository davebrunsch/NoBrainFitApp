import React, { useState } from 'react';
import { RecipeSuggestions, Recipe } from '../types';
import { store } from '../lib/store';
import { ArrowLeft, Clock, ShoppingCart, ChevronRight, Check, Sparkles } from 'lucide-react';

interface CookResultScreenProps {
  suggestions: RecipeSuggestions;
  effort: string;
  portions: string;
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenShoppingList: () => void;
}

export const CookResultScreen: React.FC<CookResultScreenProps> = ({
  suggestions,
  effort,
  portions,
  onBack,
  onSelectRecipe,
  onOpenShoppingList,
}) => {
  const [addedCount, setAddedCount] = useState<number | null>(null);

  const handleAddAllToShoppingList = () => {
    const count = store.addShoppingItems(suggestions.shoppingList);
    setAddedCount(count);
    setTimeout(() => setAddedCount(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={onOpenShoppingList}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16161B] border border-white/10 text-[12px] font-mono font-bold text-[#86868F] hover:text-[#C4ED4A] transition-colors"
        >
          <ShoppingCart size={14} />
          <span>Liste ({store.getShoppingList().length})</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C4ED4A]/10 text-[#C4ED4A] border border-[#C4ED4A]/25">
            Piliers 03 · Cuisine
          </span>
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
            {effort} · {portions}
          </span>
        </div>
        <h2 className="font-head text-[24px] font-bold text-[#F2F2F4]">
          Tes 3 recettes de la semaine
        </h2>
        <p className="text-[13px] text-[#86868F] mt-1">
          Choisis ton plat ou ajoute les ingrédients à ta liste de courses.
        </p>
      </div>

      {/* 3 Recipes Cards */}
      <div className="space-y-3 mb-8">
        {suggestions.recipes.map((r, i) => (
          <div
            key={i}
            onClick={() => onSelectRecipe(r)}
            className="p-4 rounded-[18px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#1A1A20] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-head text-[16px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors leading-snug">
                {r.name}
              </h3>
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#86868F] bg-white/5 px-2 py-0.5 rounded-md flex-shrink-0">
                <Clock size={12} />
                <span>{r.timeMin} min</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/6">
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#86868F]">
                <span className="text-[#C4ED4A] font-bold">{r.kcal} kcal</span>
                <span>P: {r.protG}g</span>
                <span>G: {r.carbsG}g</span>
                <span>L: {r.fatG}g</span>
              </div>
              <ChevronRight size={16} className="text-[#55555E] group-hover:text-[#C4ED4A] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Consolidated Shopping List Preview */}
      <div className="p-5 rounded-[20px] bg-[#16161B] border border-white/8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-[#C4ED4A]" />
            <h4 className="font-head text-[15px] font-bold text-white">
              Liste de courses consolidée
            </h4>
          </div>
          <span className="font-mono text-[11px] text-[#86868F]">
            {suggestions.shoppingList.length} articles
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5 max-h-36 overflow-y-auto pr-1">
          {suggestions.shoppingList.map((item, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-[8px] bg-[#1C1C22] border border-white/6 text-[#D8D8DE]"
            >
              {item}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddAllToShoppingList}
          className="w-full py-3 px-4 rounded-[12px] bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 text-[#C4ED4A] hover:bg-[#C4ED4A]/20 font-head font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {addedCount !== null ? (
            <>
              <Check size={16} />
              <span>{addedCount} article(s) ajouté(s) à la liste !</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Ajouter tout à ma liste de courses</span>
            </>
          )}
        </button>
      </div>

      {/* Sticky footer action */}
      <div className="fixed bottom-6 left-0 right-0 max-w-lg mx-auto px-5 z-20">
        <button
          type="button"
          onClick={onOpenShoppingList}
          className="w-full py-3.5 px-6 rounded-[16px] bg-[#1C1C22] border border-white/12 text-white font-head font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#25252E] transition-all cursor-pointer shadow-xl"
        >
          <ShoppingCart size={16} />
          <span>Accéder à ma liste de courses</span>
        </button>
      </div>
    </div>
  );
};
