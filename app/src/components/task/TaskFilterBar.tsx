import React from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { TaskCategory, TaskStatus } from '../../types';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: TaskCategory | 'All';
  onCategoryChange: (cat: TaskCategory | 'All') => void;
  selectedStatus: TaskStatus | 'all';
  onStatusChange: (status: TaskStatus | 'all') => void;
  sortBy: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon';
  onSortChange: (sort: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon') => void;
  totalResults: number;
  statusCounts?: Partial<Record<TaskStatus | 'all', number>>;
}

const CATEGORIES: (TaskCategory | 'All')[] = [
  'All',
  'Solana Dev',
  'Smart Contracts',
  'UI/UX Design',
  'Security Audit',
  'Content & Docs',
  'Full Stack',
];

const STATUS_TABS: { id: TaskStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All listings' },
  { id: 'open', label: 'Funded · claimable' },
  { id: 'in_progress', label: 'Needs submission' },
  { id: 'under_review', label: 'Under review' },
  { id: 'completed', label: 'Paid to you' },
];

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  totalResults,
  statusCounts = {},
}) => {
  return (
    <div className="space-y-5">
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search bounties by keyword, tag, or requirement..."
            className="brutalist-input pl-10 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <ArrowUpDown className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint" />
            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange(
                  event.target.value as 'newest' | 'highest_reward' | 'lowest_reward' | 'expiring_soon'
                )
              }
              className="brutalist-input cursor-pointer pl-9 pr-8"
              aria-label="Sort bounties"
            >
              <option value="newest">Newest first</option>
              <option value="highest_reward">Highest reward</option>
              <option value="lowest_reward">Lowest reward</option>
              <option value="expiring_soon">Expiring soon</option>
            </select>
          </div>
          <span className="hidden whitespace-nowrap text-xs font-bold text-ink-faint lg:block">
            {totalResults} {totalResults === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            role="tab"
            aria-selected={selectedCategory === category}
            className={`tab-chip ${selectedCategory === category ? 'tab-chip-active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div
        className="flex items-center justify-between border-t border-ink/10 pt-4"
        role="tablist"
        aria-label="Status"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              role="tab"
              aria-selected={selectedStatus === tab.id}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedStatus === tab.id ? 'border-ink bg-lime text-ink shadow-brutal-sm' : 'border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink'}`}
            >
              {tab.label}
              {statusCounts[tab.id] !== undefined && (
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${selectedStatus === tab.id ? 'bg-ink/10 text-ink' : 'bg-paper-gray text-ink-faint'}`}>
                  {statusCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
