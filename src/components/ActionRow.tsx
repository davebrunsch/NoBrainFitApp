import React, { useState } from 'react';
import { LucideIcon, ChevronRight, Sparkles } from 'lucide-react';
import { Brand } from '../lib/brand';
import { QuickPickItem } from './QuickSheet';

interface ActionRowProps {
  index: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  onNavigate: () => void;
  quickPicks?: QuickPickItem[];
  customAction?: {
    label: string;
    onClick: () => void;
  };
}

export const ActionRow: React.FC<ActionRowProps> = ({
  index,
  icon: Icon,
  kicker,
  title,
  sub,
  onNavigate,
  quickPicks,
  customAction,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`w-full rounded-[22px] border transition-all duration-150 overflow-hidden ${
        isPressed
          ? 'bg-[#1A1A20] border-[#C4ED4A]/30 scale-[0.99]'
          : 'bg-[#16161B] border-white/8 hover:border-white/16'
      }`}
    >
      {/* Primary header area (opens full AI flow) */}
      <button
        type="button"
        onClick={onNavigate}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-4 cursor-pointer group"
      >
        {/* Icon box */}
        <div className="w-[48px] h-[48px] rounded-[16px] border border-white/12 bg-[#1C1C22] flex items-center justify-center flex-shrink-0 group-hover:border-[#C4ED4A]/40 group-hover:text-[#C4ED4A] text-[#86868F] transition-colors">
          <Icon size={22} />
        </div>

        {/* Text details */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#86868F] mb-0.5">
            {kicker}
          </div>
          <div className="font-head text-[19px] sm:text-[21px] font-semibold text-[#F2F2F4] tracking-tight truncate group-hover:text-white transition-colors">
            {title}
          </div>
          <div className="text-[12px] text-[#86868F] truncate mt-0.5">
            {sub}
          </div>
        </div>

        {/* Index and chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono text-[12px] font-bold"
            style={{ color: Brand.lume }}
          >
            {index}
          </span>
          <ChevronRight size={18} className="text-[#55555E] group-hover:text-[#C4ED4A] transition-colors" />
        </div>
      </button>

      {/* Embedded horizontal quick-picks for instant 1-tap launch */}
      {quickPicks && quickPicks.length > 0 && (
        <div className="px-4 pb-4 pt-1 border-t border-white/6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#666672] font-bold">
              Lancement immédiat (1 clic)
            </span>
            <span className="font-mono text-[9px] text-[#C4ED4A] flex items-center gap-1">
              <Sparkles size={10} />
              <span>IA prête</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickPicks.map((pick, i) => {
              const PickIcon = pick.icon;
              // Shorten labels for crisp presentation: e.g. "15 min · Maison"
              const parts = pick.label.split('·').map((s) => s.trim());
              const duration = parts[0] || '15 min';
              const location = parts[1] || '';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    pick.onSelect();
                  }}
                  className="p-2.5 rounded-[14px] bg-[#1C1C22] border border-white/7 hover:border-[#C4ED4A]/50 hover:bg-[#C4ED4A]/10 active:scale-95 transition-all text-left flex flex-col justify-between min-h-[58px] cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[#86868F] group-hover:text-[#C4ED4A] transition-colors">
                    <PickIcon size={14} />
                    <span className="font-mono text-[11px] font-bold text-white group-hover:text-[#C4ED4A]">
                      {duration}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#86868F] truncate mt-1">
                    {location}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional secondary custom builder shortcut */}
          {customAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                customAction.onClick();
              }}
              className="mt-2.5 w-full py-2 px-3 rounded-[12px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-[#86868F] hover:text-white transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C4ED4A] animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                  {customAction.label}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#C4ED4A] font-bold">
                Atelier →
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

