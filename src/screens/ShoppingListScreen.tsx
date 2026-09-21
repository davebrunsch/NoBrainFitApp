import React, { useState, useEffect } from 'react';
import { store } from '../lib/store';
import { ShoppingItem } from '../types';
import { ArrowLeft, Plus, Trash2, Check, ShoppingBag } from 'lucide-react';

interface ShoppingListScreenProps {
  onBack: () => void;
}

export const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ onBack }) => {
  const [items, setItems] = useState<ShoppingItem[]>(store.getShoppingList());
  const [newItemText, setNewItemText] = useState('');

  const refresh = () => {
    setItems(store.getShoppingList());
  };

  useEffect(() => {
    const unsub = store.subscribe(refresh);
    return unsub;
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    store.addShoppingItems([newItemText.trim()]);
    setNewItemText('');
    refresh();
  };

  const handleToggle = (id: string) => {
    store.toggleShoppingItem(id);
    refresh();
  };

  const handleRemoveChecked = () => {
    store.removeCheckedShoppingItems();
    refresh();
  };

  const handleClearAll = () => {
    if (confirm('Vider toute la liste de courses ?')) {
      store.clearShoppingList();
      refresh();
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;

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
          <div className="flex items-center gap-2">
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={handleRemoveChecked}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Supprimer cochés ({checkedCount})
              </button>
            )}
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="w-9 h-9 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#55555E] hover:text-rose-400"
                title="Tout effacer"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C4ED4A]">
            Courses automatiques
          </span>
          <h2 className="font-head text-[24px] font-bold text-[#F2F2F4]">
            Ma liste de courses
          </h2>
          <p className="text-[13px] text-[#86868F] mt-1">
            {items.length} article(s) · Coche au fur et à mesure en magasin.
          </p>
        </div>

        {/* Add custom item form */}
        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Ajouter un article (ex: bananes, amandes…)"
            className="flex-1 px-4 py-2.5 rounded-[12px] bg-[#16161B] border border-white/10 text-white placeholder-white/25 text-[13px] focus:border-[#C4ED4A] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-[12px] bg-[#C4ED4A] text-[#0B0B0F] font-bold text-[13px] hover:bg-[#b5dc3f] flex items-center gap-1 cursor-pointer"
          >
            <Plus size={16} />
            <span>Ajouter</span>
          </button>
        </form>

        {/* List items */}
        {items.length === 0 ? (
          <div className="p-12 text-center rounded-[20px] bg-[#16161B] border border-white/6 text-[#86868F]">
            <ShoppingBag size={36} className="mx-auto mb-3 text-[#55555E]" />
            <p className="font-head text-[16px] font-bold text-white mb-1">
              Ta liste est vide
            </p>
            <p className="text-[12px] text-[#86868F] max-w-xs mx-auto">
              Génère des recettes dans "Cuisiner" ou ajoute manuellement tes basiques ci-dessus.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`p-3.5 rounded-[14px] border flex items-center gap-3 cursor-pointer select-none transition-all ${
                  item.checked
                    ? 'bg-[#16161B]/60 border-white/5 opacity-50'
                    : 'bg-[#16161B] border-white/8 hover:border-white/18'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-[#C4ED4A] border-[#C4ED4A] text-black'
                      : 'bg-[#1C1C22] border-white/20 text-transparent'
                  }`}
                >
                  <Check size={13} />
                </div>
                <span
                  className={`text-[14px] flex-1 ${
                    item.checked ? 'line-through text-[#86868F]' : 'text-white'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
