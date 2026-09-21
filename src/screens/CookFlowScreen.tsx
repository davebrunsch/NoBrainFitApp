import React, { useState } from 'react';
import { ArrowLeft, Sparkles, ChefHat, Users } from 'lucide-react';
import { aiService } from '../services/aiService';
import { RecipeSuggestions } from '../types';

interface CookFlowScreenProps {
  onBack: () => void;
  onRecipesGenerated: (suggestions: RecipeSuggestions, effort: string, portions: string) => void;
}

const EFFORT_OPTIONS = [
  { label: 'La flemme', sub: 'Moins de 10 min · Assemblage express' },
  { label: 'Un peu', sub: '20-25 min · Une poêle, simple & sain' },
  { label: 'Motivé', sub: '40-45 min · Plat complet élaboré' },
  { label: 'Juste les courses', sub: 'Plein de basiques pour la semaine' },
];

const PORTION_OPTIONS = [
  { label: 'Juste moi', sub: '1 portion' },
  { label: '2 personnes', sub: 'Repas en duo' },
  { label: 'Famille', sub: '4 personnes' },
  { label: 'Meal prep', sub: '6 portions à congeler' },
];

export const CookFlowScreen: React.FC<CookFlowScreenProps> = ({
  onBack,
  onRecipesGenerated,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEffort, setSelectedEffort] = useState<string>('Un peu');
  const [loading, setLoading] = useState(false);

  const handleEffort = (effort: string) => {
    setSelectedEffort(effort);
    setStep(2);
  };

  const handlePortions = async (portions: string) => {
    setLoading(true);
    try {
      const suggestions = await aiService.generateRecipes(selectedEffort, portions);
      onRecipesGenerated(suggestions, selectedEffort, portions);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
            Cuisine · Étape {step} / 2
          </span>
          <div className="w-10" />
        </div>

        {/* Step 1: Effort */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <ChefHat size={14} />
                <span>Niveau d'effort</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                T'as envie de cuisiner ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                3 recettes adaptées + liste de courses générée d'un coup.
              </p>
            </div>

            <div className="space-y-2.5">
              {EFFORT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleEffort(opt.label)}
                  className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div>
                    <div className="font-head text-[17px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                      {opt.label}
                    </div>
                    <div className="text-[12px] text-[#86868F] mt-0.5">
                      {opt.sub}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-[#55555E] group-hover:text-[#C4ED4A]">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Portions */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <Users size={14} />
                <span>Quantités</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Pour combien de personnes ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Effort : <strong className="text-[#C4ED4A]">{selectedEffort}</strong>
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 border-3 border-[#C4ED4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="font-head text-[17px] font-bold text-white">
                  Création des 3 recettes…
                </div>
                <p className="text-[12px] text-[#86868F] mt-1">
                  Équilibrage des macros et consolidation des courses
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {PORTION_OPTIONS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePortions(p.label)}
                    className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <div>
                      <div className="font-head text-[17px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                        {p.label}
                      </div>
                      <div className="text-[12px] text-[#86868F] mt-0.5">
                        {p.sub}
                      </div>
                    </div>
                    <Sparkles size={18} className="text-[#55555E] group-hover:text-[#C4ED4A]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 text-center">
        <p className="font-mono text-[11px] text-[#55555E]">
          3 recettes équilibrées + liste de courses instantanée
        </p>
      </div>
    </div>
  );
};
