import type React from 'react';
import { ArrowRight, Coins, FolderOpen, HandCoins, Inbox, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Task } from '../types';
import { useAppWallet } from '../context/WalletContext';
import { useTasks } from '../context/TaskContext';
import { solanaService } from '../services/solanaService';
import { Button, EmptyState, StatusBadge } from './ui';

function MetricCard({
  label,
  value,
  suffix,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <span className={accent}>{icon}</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-white">
        {value}
        {suffix && <span className="ml-1.5 text-xs font-semibold text-slate-400">{suffix}</span>}
      </p>
    </div>
  );
}

function TaskList({
  title,
  tasks,
  emptyText,
  onOpenTask,
}: {
  title: string;
  tasks: Task[];
  emptyText: string;
  onOpenTask: (id: string) => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <button
              key={task.id}
              onClick={() => onOpenTask(task.id)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left transition hover:border-solana-purple/30 hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-100">{task.title}</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  #{task.onChainId} · {task.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs font-bold text-solana-green">
                  {solanaService.formatSol(task.rewardSol)}
                </span>
                <StatusBadge status={task.status} />
                <ArrowRight size={13} className="text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardView({
  onOpenTask,
  onExplore,
}: {
  onOpenTask: (id: string) => void;
  onExplore: () => void;
}) {
  const { publicKeyString, connected } = useAppWallet();
  const { metrics, tasks } = useTasks();

  const createdByMe = tasks.filter((task) => task.creatorAddress === publicKeyString);
  const assignedToMe = tasks.filter((task) => task.workerAddress === publicKeyString);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Your dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            {connected ? (
              <>
                Wallet{' '}
                <span className="font-mono text-slate-300">
                  {solanaService.shortenAddress(publicKeyString, 6)}
                </span>
              </>
            ) : (
              'Connect a wallet or preview a persona to see personalized stats.'
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onExplore}>
          Browse bounties <ArrowRight size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Tasks created"
          value={metrics.tasksCreated}
          icon={<FolderOpen size={16} />}
          accent="text-solana-purple"
        />
        <MetricCard
          label="Tasks claimed"
          value={metrics.tasksClaimed}
          icon={<HandCoins size={16} />}
          accent="text-sky-400"
        />
        <MetricCard
          label="Awaiting approval"
          value={metrics.tasksAwaitingApproval}
          icon={<ShieldCheck size={16} />}
          accent="text-amber-400"
        />
        <MetricCard
          label="Completed"
          value={metrics.completedTasks}
          icon={<TrendingUp size={16} />}
          accent="text-solana-green"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-green/10 text-solana-green">
            <Coins size={18} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">SOL earned</p>
            <p className="font-mono text-xl font-bold text-white">
              {solanaService.formatSol(metrics.totalSolEarned)}
            </p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solana-purple/10 text-violet-300">
            <Wallet size={18} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">SOL funded</p>
            <p className="font-mono text-xl font-bold text-white">
              {solanaService.formatSol(metrics.totalSolFunded)}
            </p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Active escrow</p>
            <p className="font-mono text-xl font-bold text-white">
              {solanaService.formatSol(metrics.activeEscrowSol)}
            </p>
          </div>
        </div>
      </div>

      {!connected ? (
        <EmptyState
          icon={<Inbox size={22} />}
          title="No wallet connected"
          description="Connect your Solana wallet or choose a demo persona in the header to see your tasks and earnings."
          action={
            <Button variant="secondary" size="sm" onClick={onExplore}>
              Explore public bounties
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TaskList
            title="Created by me"
            tasks={createdByMe}
            emptyText="You have not created any tasks yet."
            onOpenTask={onOpenTask}
          />
          <TaskList
            title="Assigned to me"
            tasks={assignedToMe}
            emptyText="Claim a bounty to start earning."
            onOpenTask={onOpenTask}
          />
        </div>
      )}
    </section>
  );
}
