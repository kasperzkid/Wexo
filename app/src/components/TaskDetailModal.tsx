import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Task, TaskHistoryEvent } from '../types';
import { useAppWallet } from '../context/WalletContext';
import { useTasks } from '../context/TaskContext';
import { useNotification } from '../context/NotificationContext';
import {
  getExplorerAddressUrl,
  getExplorerTxUrl,
} from '../config/solana';
import { solanaService } from '../services/solanaService';
import { Button, FieldLabel, CATEGORY_META, cn, inputClass, Modal, STATUS_META, StatusBadge } from './ui';

const TIMELINE_ICON: Record<TaskHistoryEvent['type'], string> = {
  created: '○',
  funded: '◈',
  claimed: '→',
  work_submitted: '⇧',
  approved: '✓',
  cancelled: '×',
  revision_requested: '↺',
};

export function TaskDetailModal({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const { publicKeyString, connected } = useAppWallet();
  const { claimTask, approveWork, cancelTask, submitWork } = useTasks();
  const { showToast } = useNotification();

  const [notes, setNotes] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [busy, setBusy] = useState(false);

  if (!task) return null;

  const isCreator = connected && !!publicKeyString && task.creatorAddress === publicKeyString;
  const isWorker = connected && !!publicKeyString && !!task.workerAddress && task.workerAddress === publicKeyString;
  const canSeeSubmission = isCreator || isWorker;
  const viewerStatus = !canSeeSubmission
    ? task.status === 'completed' || task.status === 'cancelled' ? 'closed' : 'open'
    : task.status;
  const canClaim = viewerStatus === 'open' && !isCreator;
  const canSubmit = task.status === 'in_progress' && isWorker;
  const canApprove = task.status === 'under_review' && isCreator;
  const canCancel =
    (task.status === 'open' || task.status === 'in_progress') && isCreator;
  const deadline = solanaService.getDaysRemaining(task.deadline);

  const run = async (label: string, action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      showToast('error', `${label} failed`, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  const onClaim = () => run('Claim task', () => claimTask(task.id));
  const onApprove = () => run('Approve work', () => approveWork(task.id));
  const onCancel = () => run('Cancel task', () => cancelTask(task.id));
  const onSubmit = () =>
    run('Submit work', async () => {
      if (!notes.trim()) throw new Error('Please describe what you delivered.');
      await submitWork(task.id, {
        pullRequestUrl: prUrl.trim() || undefined,
        liveDemoUrl: demoUrl.trim() || undefined,
        deliverableNotes: notes.trim(),
      });
      setNotes('');
      setPrUrl('');
      setDemoUrl('');
    });

  return (
    <Modal
      open
      onClose={onClose}
      title={canSeeSubmission ? task.title : 'Bounty details'}
      subtitle={`Task #${task.onChainId} · ${task.category}${task.createdAt ? ` · posted ${new Date(task.createdAt).toLocaleDateString()}` : ''}`}
      maxWidth="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={viewerStatus} />
            <span className={cn('text-sm', CATEGORY_META[task.category].tint)}>
              {CATEGORY_META[task.category].icon} {task.category}
            </span>
          </div>

          {canSeeSubmission && <section>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileText size={14} /> Brief
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">{task.description}</p>
          </section>}

          {canSeeSubmission && task.submissionInstructions && (
            <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Submission requirements
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {task.submissionInstructions}
              </p>
            </section>
          )}

          {task.submission && canSeeSubmission && (
            <section className="rounded-xl border border-sky-400/20 bg-sky-400/[0.04] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                <Link2 size={14} /> Submitted deliverables
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {task.submission.deliverableNotes}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {task.submission.pullRequestUrl && (
                  <a
                    href={task.submission.pullRequestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-sky-300 hover:border-sky-400/40"
                  >
                    Pull request <ExternalLink size={12} />
                  </a>
                )}
                {task.submission.liveDemoUrl && (
                  <a
                    href={task.submission.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-sky-300 hover:border-sky-400/40"
                  >
                    Live demo <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </section>
          )}

          {canSubmit && (
            <section className="rounded-xl border border-solana-purple/25 bg-solana-purple/[0.04] p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-300">
                Submit your work
              </h3>
              <div className="space-y-3">
                <div>
                  <FieldLabel>Deliverable notes *</FieldLabel>
                  <textarea
                    className={cn(inputClass, 'min-h-[90px] resize-y')}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="What did you build? Any notes for the creator..."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Pull request URL</FieldLabel>
                    <input
                      className={inputClass}
                      value={prUrl}
                      onChange={(event) => setPrUrl(event.target.value)}
                      placeholder="https://github.com/.../pull/1"
                    />
                  </div>
                  <div>
                    <FieldLabel>Live demo URL</FieldLabel>
                    <input
                      className={inputClass}
                      value={demoUrl}
                      onChange={(event) => setDemoUrl(event.target.value)}
                      placeholder="https://demo.example.com"
                    />
                  </div>
                </div>
                <Button onClick={onSubmit} disabled={busy} size="sm">
                  Submit for review
                </Button>
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity
            </h3>
            <ol className="relative space-y-4 border-l border-white/10 pl-5">
              {[...task.history].reverse().map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-navy-850 text-[9px] text-solana-green">
                    {TIMELINE_ICON[event.type]}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold capitalize text-slate-200">
                      {event.type.replace(/_/g, ' ')}
                      {event.amountSol ? ` · ${solanaService.formatSol(event.amountSol)} SOL` : ''}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.note && <p className="mt-0.5 text-[11px] text-slate-500">{event.note}</p>}
                  {event.txHash && (
                    <a
                      href={getExplorerTxUrl(event.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-solana-purple hover:underline"
                    >
                      {solanaService.shortenAddress(event.txHash, 8)} <ExternalLink size={9} />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Escrowed reward</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-solana-green">
                {solanaService.formatSol(task.rewardSol)}
              </span>
              <span className="text-sm font-bold text-slate-300">SOL</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              ≈ {solanaService.solToUsd(task.rewardSol)}
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-solana-green/15 bg-solana-green/[0.05] px-3 py-2 text-[11px] text-solana-green">
              <Lock size={13} /> Held in program escrow PDA
            </div>
          </div>

          <div className="glass-panel space-y-4 rounded-2xl p-5 text-xs">
            <div>
              <p className="mb-1 text-slate-500">Creator</p>
              <a
                href={getExplorerAddressUrl(task.creatorAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-slate-200 hover:text-solana-green"
              >
                {solanaService.shortenAddress(task.creatorAddress, 6)} <ExternalLink size={10} />
              </a>
            </div>
            {task.workerAddress && (
              <div>
                <p className="mb-1 text-slate-500">Contributor</p>
                <a
                  href={getExplorerAddressUrl(task.workerAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-slate-200 hover:text-solana-green"
                >
                  {solanaService.shortenAddress(task.workerAddress, 6)} <ExternalLink size={10} />
                </a>
              </div>
            )}
            <div>
              <p className="mb-1 text-slate-500">Deadline</p>
              <p className="flex items-center gap-1.5 text-slate-200">
                <CalendarDays size={12} />
                {new Date(task.deadline).toLocaleDateString()} ·{' '}
                <span className={deadline.isPast ? 'text-rose-300' : 'text-amber-300'}>
                  {deadline.text}
                </span>
              </p>
            </div>
            {task.escrowPda && (
              <div>
                <p className="mb-1 text-slate-500">Escrow PDA</p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(task.escrowPda || '');
                    showToast('success', 'Copied', 'Escrow address copied to clipboard');
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-slate-200 hover:text-solana-green"
                >
                  {solanaService.shortenAddress(task.escrowPda, 6)} <Copy size={10} />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-3">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {canClaim && (
              <Button onClick={onClaim} disabled={busy || !connected} className="w-full">
                <CheckCircle2 size={15} /> Claim this bounty
              </Button>
            )}
            {canApprove && (
              <Button onClick={onApprove} disabled={busy} className="w-full">
                <ShieldCheck size={15} /> Approve & release payment
              </Button>
            )}
            {canCancel && (
              <Button onClick={onCancel} disabled={busy} variant="danger" className="w-full">
                Cancel & refund escrow
              </Button>
            )}
            {task.status === 'completed' && canSeeSubmission && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] px-4 py-3 text-xs font-semibold text-violet-300">
                <CheckCircle2 size={15} /> Payment released to contributor
              </div>
            )}
            {!connected && (
              <p className="text-center text-[11px] text-slate-500">
                Connect a wallet or preview a persona to take action.
              </p>
            )}
            {connected && !canClaim && !canSubmit && !canApprove && !canCancel && (
              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
                <Clock3 size={12} /> No action available for your role on this task.
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-slate-600">
              <Users size={11} /> Program ID: {solanaService.shortenAddress('G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR', 8)}
            </p>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
