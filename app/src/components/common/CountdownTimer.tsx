import React from 'react';
import { Clock } from 'lucide-react';
import { solanaService } from '../../services/solanaService';

interface CountdownTimerProps {
  deadline: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const remaining = solanaService.getDaysRemaining(deadline);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
        remaining.isPast
          ? 'bg-red-100 border-red-500 text-red-700'
          : remaining.days <= 2
          ? 'bg-orange-100 border-orange-500 text-orange-700'
          : 'bg-paper-gray border-ink text-ink-muted'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{remaining.text}</span>
    </div>
  );
};
