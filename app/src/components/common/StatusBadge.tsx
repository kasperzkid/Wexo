import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'open':
        return { bg: 'bg-lime border-ink text-ink', dot: 'bg-ink animate-pulse', label: 'Open' };
      case 'in_progress':
        return { bg: 'bg-yellow-200 border-ink text-ink', dot: 'bg-ink', label: 'In Progress' };
      case 'under_review':
        return { bg: 'bg-orange-200 border-ink text-ink', dot: 'bg-orange-600 animate-bounce', label: 'In Review' };
      case 'completed':
        return { bg: 'bg-green-200 border-ink text-ink', dot: 'bg-green-700', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-200 border-ink text-ink', dot: 'bg-red-600', label: 'Cancelled' };
      default:
        return { bg: 'bg-paper-gray border-ink text-ink', dot: 'bg-ink-muted', label: status };
    }
  };

  const { bg, dot, label } = getStyles();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-lg border ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};
