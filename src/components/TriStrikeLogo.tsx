import React from 'react';
import { Brand } from '../lib/brand';

interface TriStrikeMarkProps {
  size?: number;
  className?: string;
}

export const TriStrikeMark: React.FC<TriStrikeMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
    >
      {/* Top bar: Lume */}
      <rect
        x="3"
        y="6"
        width="23"
        height="4.5"
        rx="1.5"
        transform="rotate(-18 14.5 8.25)"
        fill={Brand.lume}
      />
      {/* Middle bar: Acier */}
      <rect
        x="3"
        y="14"
        width="23"
        height="4.5"
        rx="1.5"
        transform="rotate(-18 14.5 16.25)"
        fill={Brand.acier}
      />
      {/* Bottom bar: Titane */}
      <rect
        x="3"
        y="22"
        width="23"
        height="4.5"
        rx="1.5"
        transform="rotate(-18 14.5 24.25)"
        fill={Brand.titane}
      />
    </svg>
  );
};

interface TriStrikeWordmarkProps {
  markSize?: number;
  className?: string;
  onClick?: () => void;
}

export const TriStrikeWordmark: React.FC<TriStrikeWordmarkProps> = ({
  markSize = 26,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none cursor-pointer ${className}`}
    >
      <TriStrikeMark size={markSize} />
      <span
        style={{ fontSize: `${markSize * 0.7}px`, letterSpacing: '-0.03em' }}
        className="font-head font-bold leading-none"
      >
        <span className="text-[#F2F2F4]">NoBrain</span>
        <span className="text-[#C4ED4A]">Fit</span>
      </span>
    </div>
  );
};
