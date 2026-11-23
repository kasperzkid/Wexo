import { ArrowUpRight, CalendarDays, Clock3, Lock, Users } from 'lucide-react';
import { Task } from '../types';
import { solanaService } from '../services/solanaService';
import { CATEGORY_META, cn, StatusBadge } from './ui';

export function TaskCard({ task, onSelect }: { task: Task; onSelect: (id: string) => void }) {
  const meta = CATEGORY_META[task.category];
  const deadline = solanaService.getDaysRemaining(task.deadline);
  const isUrgent = !deadline.isPast && deadline.days < 3;

  return (
    <button
      onClick={() => onSelect(task.id)}
      className="glass-panel glass-panel-hover group flex h-full w-full flex-col rounded-2xl p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn('text-lg leading-none', meta.tint)}>{meta.icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {task.category}
          </span>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <h3 className="mt-4 line-clamp-2 text-[15px] font-bold leading-snug text-white group-hover:text-solana-green/90">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
        {task.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {task.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-slate-400"
          >
            {tag}
          </span>
        ))}
        {task.tags.length > 3 && (
          <span className="px-1 py-0.5 text-[10px] text-slate-500">+{task.tags.length - 3}</span>
        )}
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Bounty</p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold text-solana-green">
                {solanaService.formatSol(task.rewardSol)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">SOL</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Deadline</p>
            <p
              className={cn(
                'mt-1 flex items-center justify-end gap-1 text-xs font-medium',
                deadline.isPast ? 'text-slate-500' : isUrgent ? 'text-amber-300' : 'text-slate-300'
              )}
            >
              <Clock3 size={12} />
              {deadline.text}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            {task.workerAddress ? <Users size={12} /> : <Lock size={12} />}
            {task.workerAddress
              ? solanaService.shortenAddress(task.workerAddress)
              : solanaService.shortenAddress(task.creatorAddress)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-400 transition group-hover:text-solana-green">
            View task <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}

export function TaskCardSkeletonHint() {
  return (
    <div className="glass-panel rounded-2xl p-5 opacity-40">
      <CalendarDays size={16} className="text-slate-500" />
    </div>
  );
}
