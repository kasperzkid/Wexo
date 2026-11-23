import React from 'react';
import { ArrowRight, ShieldCheck, Tag, User } from 'lucide-react';
import { Task } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CategoryBadge } from '../common/CategoryBadge';
import { SolAmount } from '../common/SolAmount';
import { CountdownTimer } from '../common/CountdownTimer';
import { useAppWallet } from '../../context/WalletContext';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onClaim?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onClaim }) => {
  const { publicKeyString } = useAppWallet();
  const isCreator = publicKeyString === task.creatorAddress;
  const isWorker = publicKeyString === task.workerAddress;
  const canClaim = task.status === 'open' && !isCreator;

  return (
    <article
      onClick={() => onSelect(task)}
      className="group flex min-h-[350px] cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-brutal-sm transition duration-200 hover:-translate-y-1 hover:shadow-brutal"
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={task.category} size="sm" />
          <StatusBadge status={task.status} size="sm" />
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-black leading-snug tracking-tight text-ink group-hover:underline">
          {task.title}
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">#{task.onChainId}</span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {task.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {task.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-paper-gray px-2 py-1 text-[10px] font-semibold text-ink-muted"
            >
              <Tag className="h-2.5 w-2.5" /> {tag}
            </span>
          ))}
          {task.tags.length > 4 && (
            <span className="rounded-md border border-ink/10 bg-paper-gray px-2 py-1 text-[10px] font-semibold text-ink-faint">
              +{task.tags.length - 4}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-ink-faint">
                Bounty reward
              </span>
              <div className="mt-1"><SolAmount amount={task.rewardSol} size="md" /></div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-wider text-ink-faint">
                Deadline
              </span>
              <div className="mt-1"><CountdownTimer deadline={task.deadline} /></div>
            </div>
          </div>

          <div className="mt-4 flex min-h-10 items-center justify-between gap-2">
            {task.workerAddress ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                <User className="h-3.5 w-3.5" /> {isWorker ? 'Assigned to you' : 'Contributor assigned'}
              </span>
            ) : task.status === 'open' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5" /> Funded bounty
              </span>
            ) : <span />}

            <button
              onClick={(event) => {
                event.stopPropagation();
                if (canClaim && onClaim) onClaim(task);
                else onSelect(task);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${canClaim ? 'btn-lime' : 'btn-ghost'}`}
            >
              <span>{canClaim ? 'Claim bounty' : 'View details'}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
