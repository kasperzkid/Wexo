import React from 'react';
import { solanaService } from '../../services/solanaService';

interface SolAmountProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUsd?: boolean;
  highlight?: boolean;
}

export const SolAmount: React.FC<SolAmountProps> = ({
  amount,
  size = 'md',
  showUsd = true,
  highlight = true,
}) => {
  const formattedSol = solanaService.formatSol(amount);
  const formattedUsd = solanaService.solToUsd(amount);

  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-extrabold',
    xl: 'text-3xl font-black tracking-tight',
  }[size];

  return (
    <div className="flex flex-col items-start leading-tight">
      <div className="flex items-center gap-1.5">
        <span className={`${sizeClasses} ${highlight ? 'text-ink' : 'text-ink-muted'}`}>
          {formattedSol}
        </span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-lime border border-ink text-ink"
        >
          SOL
        </span>
      </div>
      {showUsd && (
        <span className="text-xs text-ink-faint font-normal mt-0.5">≈ {formattedUsd}</span>
      )}
    </div>
  );
};
