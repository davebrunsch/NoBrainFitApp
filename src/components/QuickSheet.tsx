import React from 'react';
import { LucideIcon, ChevronRight, X, Sparkles } from 'lucide-react';
import { Brand } from '../lib/brand';

export interface QuickPickItem {
  icon: LucideIcon;
  label: string;
  sub: string;
  onSelect: () => void;
}

interface QuickSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon;
  picks: QuickPickItem[];
  onAdvanced: () => void;
  advancedLabel?: string;
}

export const QuickSheet: React.FC<QuickSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  picks,
  onAdvanced,
  advancedLabel = 'Programme sur-mesure (IA)',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet content */}
      <div className="relative w-full max-w-lg bg-[#16161B] border-t border-white/14 rounded-t-[24px] p-5 pb-8 shadow-2xl z-10 animate-slideUp">
        {/* Grab bar */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C4ED4A]">
              <Icon size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold">
                Accès rapide
              </span>
              <h3 className="font-head text-[18px] font-bold text-[#F2F2F4] leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#86868F] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Picks */}
        <div className="space-y-2 mb-4">
          {picks.map((pick, i) => {
            const PickIcon = pick.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onClose();
                  pick.onSelect();
                }}
                className="w-full text-left flex items-center justify-between p-3.5 rounded-[14px] bg-[#1C1C22] border border-white/7 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[#16161B] border border-white/10 flex items-center justify-center text-[#D8D8DE] group-hover:text-[#C4ED4A] group-hover:border-[#C4ED4A]/30 transition-colors">
                    <PickIcon size={18} />
                  </div>
                  <div>
                    <div className="font-head text-[14px] font-semibold text-[#F2F2F4] group-hover:text-[#C4ED4A] transition-colors">
                      {pick.label}
                    </div>
                    <div className="text-[12px] text-[#86868F]">
                      {pick.sub}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#86868F] group-hover:text-[#C4ED4A] transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Advanced / AI flow button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onAdvanced();
          }}
          className="w-full py-3.5 px-4 rounded-[14px] bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 text-[#C4ED4A] hover:bg-[#C4ED4A]/15 font-head font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <Sparkles size={16} />
          <span>{advancedLabel}</span>
        </button>
      </div>
    </div>
  );
};
