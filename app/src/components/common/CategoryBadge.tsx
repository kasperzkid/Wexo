import React from 'react';
import { TaskCategory } from '../../types';

interface CategoryBadgeProps {
  category: TaskCategory;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border border-ink bg-paper-gray text-ink tracking-wide uppercase ${sizeClass}`}
    >
      {category}
    </span>
  );
};
