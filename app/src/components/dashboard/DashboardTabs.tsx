import React from 'react';
import { Task } from '../../types';
import { TaskCard } from '../task/TaskCard';
import { Inbox, Briefcase, CheckCircle2 } from 'lucide-react';

interface DashboardTabsProps {
  createdTasks: Task[];
  assignedTasks: Task[];
  completedTasks: Task[];
  onSelectTask: (task: Task) => void;
  onClaimTask: (task: Task) => void;
  onCreateClick: () => void;
  onExploreClick: () => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  createdTasks,
  assignedTasks,
  completedTasks,
  onSelectTask,
  onClaimTask,
  onCreateClick,
  onExploreClick,
}) => {
  const [activeTab, setActiveTab] = React.useState<'created' | 'assigned' | 'completed'>('created');

  const tabs = [
    {
      id: 'created' as const,
      label: 'Created by Me',
      count: createdTasks.length,
      icon: <Inbox className="w-4 h-4" />,
    },
    {
      id: 'assigned' as const,
      label: 'Claimed by Me',
      count: assignedTasks.length,
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'completed' as const,
      label: 'Completed Bounties',
      count: completedTasks.length,
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  const currentList =
    activeTab === 'created'
      ? createdTasks
      : activeTab === 'assigned'
      ? assignedTasks
      : completedTasks;

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div
        className="flex items-center gap-2 overflow-x-auto rounded-2xl border-2 border-ink bg-paper-gray p-1.5"
        style={{ boxShadow: '3px 3px 0 #0D0D0D' }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-lime text-ink border border-ink shadow-brutal-sm'
                  : 'text-ink-muted hover:bg-paper-mid hover:text-ink'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? 'bg-ink text-lime' : 'bg-ink/10 text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid or Empty State */}
      {currentList.length === 0 ? (
        <div className="brutalist-card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-paper-gray border-2 border-ink shadow-brutal-sm flex items-center justify-center text-ink mx-auto">
            {activeTab === 'created' ? (
              <Inbox className="w-6 h-6" />
            ) : activeTab === 'assigned' ? (
              <Briefcase className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="text-base font-black text-ink mb-1">
              {activeTab === 'created'
                ? 'No bounties created yet'
                : activeTab === 'assigned'
                ? 'No claimed bounties'
                : 'No completed tasks yet'}
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed font-semibold">
              {activeTab === 'created'
                ? 'Create a task bounty, deposit SOL into escrow, and let top contributors solve it.'
                : activeTab === 'assigned'
                ? 'Explore open tasks on Solana Devnet and claim your first bounty.'
                : 'Complete and deliver bounties to receive program-escrowed SOL payouts.'}
            </p>
          </div>
          <button
            onClick={activeTab === 'created' ? onCreateClick : onExploreClick}
            className="btn-lime px-5 py-2.5 text-xs"
          >
            {activeTab === 'created' ? 'Create a Bounty' : 'Explore Open Tasks'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              onClaim={onClaimTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
