import React from 'react';
import { Bookmark, User } from 'lucide-react';
import { TriStrikeWordmark } from './TriStrikeLogo';

interface TopBarProps {
  onGoHome?: () => void;
  onOpenLibrary?: () => void;
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onOpenLibrary,
  onOpenSettings,
}) => {
  return (
    <header className="flex items-center justify-between py-2">
      <TriStrikeWordmark markSize={26} onClick={onGoHome} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenLibrary}
          aria-label="Bibliothèque"
          className="w-[36px] h-[36px] rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-[#F2F2F4] hover:border-white/25 active:scale-95 transition-all"
        >
          <Bookmark size={17} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Profil et paramètres"
          className="w-[36px] h-[36px] rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-[#F2F2F4] hover:border-white/25 active:scale-95 transition-all"
        >
          <User size={17} />
        </button>
      </div>
    </header>
  );
};
