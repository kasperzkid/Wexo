import React, { useState } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { TaskCard } from '../components/task/TaskCard';
import { TaskFilterBar } from '../components/task/TaskFilterBar';
import { ArrowRight, Compass, PlusCircle, SearchX, Sparkles, Wallet } from 'lucide-react';
import { useAppWallet } from '../context/WalletContext';
import { solanaService } from '../services/solanaService';

interface ExplorePageProps {
  tasks: Task[];
  allTasks: Task[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: TaskCategory | 'All';
  onCategoryChange: (cat: TaskCategory | 'All') => void;
  selectedStatus: TaskStatus | 'all';
  onStatusChange: (status: TaskStatus | 'all') => void;
  sortBy: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon';
  onSortChange: (sort: 'highest_reward' | 'lowest_reward' | 'newest' | 'expiring_soon') => void;
  onSelectTask: (task: Task) => void;
  onClaimTask: (task: Task) => void;
  onCreateClick: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  tasks,
  allTasks,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onSelectTask,
  onClaimTask,
  onCreateClick,
}) => {
  const { connected, publicKeyString } = useAppWallet();
  const [pageSize, setPageSize] = useState(6);

  const displayedTasks = tasks.slice(0, pageSize);
  const hasMore = tasks.length > pageSize;
  const statusCounts = {
    all: allTasks.length,
    open: allTasks.filter((task) => task.status === 'open' && (!connected || task.creatorAddress !== publicKeyString)).length,
    in_progress: connected ? allTasks.filter((task) => task.status === 'in_progress' && task.workerAddress === publicKeyString).length : 0,
    under_review: connected ? allTasks.filter((task) => task.status === 'under_review' && task.workerAddress === publicKeyString).length : 0,
    completed: connected ? allTasks.filter((task) => task.status === 'completed' && task.workerAddress === publicKeyString).length : 0,
    cancelled: 0,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header
        className="relative overflow-hidden rounded-3xl border-2 border-ink bg-lime p-7 sm:p-10 text-ink shadow-brutal-lg"
        style={{ boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full border-4 border-ink/10 opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-24 h-48 w-48 rounded-full bg-white/25"
        />

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink bg-white px-3.5 py-1 text-xs font-black tracking-wide text-ink shadow-brutal-sm">
              <Compass className="h-3.5 w-3.5 text-ink animate-spin" style={{ animationDuration: '8s' }} />
              <span>Wexo Marketplace</span>
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              <span className="text-[11px] font-semibold text-ink-muted">Solana Devnet</span>
            </div>

            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Find a bounty <span className="underline decoration-ink/40 decoration-4">worth building.</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-ink-soft font-medium">
              Explore scoped work by skill, reward, and timeline. Open a listing to review its requirements before you commit.
            </p>

            <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-ink/20 bg-white/85 px-3.5 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-lime border border-ink">
                <Wallet className="h-3 w-3 text-ink" />
              </div>
              <span>
                {connected
                  ? `Personal queues for ${solanaService.shortenAddress(publicKeyString, 5)}`
                  : 'Connect your wallet to see your submissions, reviews, and payouts'}
              </span>
            </div>
          </div>

          <div className="shrink-0 pt-2 sm:pt-0">
            <button
              onClick={onCreateClick}
              className="btn-black px-6 py-3.5 text-xs font-black shadow-brutal flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post a Bounty</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Search and filters */}
      <section aria-label="Filter bounty listings" className="rounded-2xl border-2 border-ink/10 bg-white p-4 sm:p-5">
      <TaskFilterBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        totalResults={tasks.length}
        statusCounts={statusCounts}
      />
      </section>

      <div className="flex items-end justify-between gap-4 border-b border-ink/10 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-faint">Browse listings</span>
          <h2 className="mt-1 text-xl font-black tracking-tight text-ink">Bounties for your next build</h2>
        </div>
        <span className="rounded-lg border border-ink/15 bg-paper-gray px-3 py-1.5 text-xs font-bold text-ink-muted">
          {tasks.length} {tasks.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Task Grid */}
      {displayedTasks.length === 0 ? (
        <div className="brutalist-card mx-auto max-w-md space-y-4 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-paper-gray border-2 border-ink shadow-brutal-sm flex items-center justify-center text-ink mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-ink mb-1">
              {allTasks.length === 0 ? 'No live Devnet bounties yet' : 'No bounties match your filters'}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {allTasks.length === 0
                ? 'Published and funded Wexo bounties on Solana Devnet will appear here.'
                : 'Try another keyword or clear a filter to see more listings.'}
            </p>
          </div>
          {allTasks.length > 0 && <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('All');
              onStatusChange('all');
            }}
            className="btn-ghost px-5 py-2 text-xs"
          >
            Clear All Filters
          </button>}
          {allTasks.length === 0 && <button onClick={onCreateClick} className="btn-lime px-5 py-2.5 text-xs">Create the first bounty</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              onClaim={onClaimTask}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={() => setPageSize((prev) => prev + 6)}
            className="btn-ghost px-6 py-2.5 text-xs"
          >
            Show more listings <Sparkles className="h-3.5 w-3.5" /> ({tasks.length - pageSize} more)
          </button>
        </div>
      )}
    </div>
  );
};
