import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  Coins,
  FileText,
  ShieldCheck,
  Tag,
  WalletCards,
  X,
} from 'lucide-react';
import { TaskCategory } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAppWallet } from '../context/WalletContext';
import { solanaService } from '../services/solanaService';
import { SolAmount } from '../components/common/SolAmount';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { CONFIG } from '../config/solana';

const CATEGORIES: TaskCategory[] = [
  'Solana Dev', 'Smart Contracts', 'UI/UX Design', 'Security Audit', 'Content & Docs', 'Full Stack',
];

interface CreateTaskPageProps {
  onSuccess: (taskId: string) => void;
  onCancel: () => void;
}

export const CreateTaskPage: React.FC<CreateTaskPageProps> = ({ onSuccess, onCancel }) => {
  const { createTask } = useTasks();
  const { connected, balanceSol, publicKeyString } = useAppWallet();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Solana Dev');
  const [description, setDescription] = useState('');
  const [rewardSol, setRewardSol] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [instructions, setInstructions] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const numRewardSol = parseFloat(rewardSol) || 0;
  const calculatedDeadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();
    const value = tagInput.trim().replace(/^#/, '');
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase()) && tags.length < 5) {
      setTags((current) => [...current, value]);
      setTagInput('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!connected) { setError('Connect your Solana wallet to publish and fund this bounty.'); return; }
    if (!title.trim() || title.trim().length < 10) { setError('Add a clear title with at least 10 characters.'); return; }
    if (!description.trim() || description.trim().length < 30) { setError('Describe the scope and deliverables in at least 30 characters.'); return; }
    if (numRewardSol < CONFIG.minBountySol) { setError(`The minimum bounty is ${CONFIG.minBountySol} SOL.`); return; }
    if (numRewardSol > CONFIG.maxBountySol) { setError(`The maximum bounty is ${CONFIG.maxBountySol} SOL.`); return; }
    if (balanceSol < numRewardSol) { setError(`Insufficient balance. Your wallet has ${balanceSol.toFixed(3)} SOL.`); return; }

    try {
      setIsSubmitting(true);
      setError('');
      const task = await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        rewardSol: numRewardSol,
        deadline: calculatedDeadline,
        submissionInstructions: instructions.trim() || undefined,
        tags,
      });
      onSuccess(task.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the bounty. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const balanceAfterFunding = Math.max(0, balanceSol - numRewardSol);
  const shortWallet = publicKeyString ? `${publicKeyString.slice(0, 4)}…${publicKeyString.slice(-4)}` : '';

  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mb-8 flex flex-col gap-5 border-b border-ink/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button type="button" onClick={onCancel} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-ink-muted transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-ink bg-lime shadow-brutal-sm">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-green-800">Create a new opportunity</p>
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">Create & fund a bounty</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Set a clear scope, choose a reward, and fund it in Devnet escrow. Your bounty goes live after your wallet confirms the transaction.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-900/15 bg-green-50 px-3 py-2 text-xs font-bold text-green-900">
          <span className="h-2 w-2 rounded-full bg-green-600" /> Solana Devnet
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <section className="brutalist-card space-y-6 p-5 sm:p-7" aria-labelledby="bounty-details-heading">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper-gray text-ink"><FileText className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted">Step 01 · Define the work</p>
                <h2 id="bounty-details-heading" className="mt-1 text-lg font-black text-ink">Bounty details</h2>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="bounty-title" className="text-sm font-bold text-ink">Bounty title <span className="text-green-700">*</span></label>
                <span className="text-xs tabular-nums text-ink-faint">{title.length}/80</span>
              </div>
              <input id="bounty-title" type="text" value={title} onChange={(event) => setTitle(event.target.value)}
                placeholder="What should the contributor build?" className="brutalist-input !py-3 text-sm" maxLength={80} minLength={10} required />
              <p className="mt-2 text-xs text-ink-faint">Be specific. A strong title helps the right people find your bounty.</p>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-bold text-ink">Choose a category <span className="text-green-700">*</span></legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((item) => (
                  <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-bold transition duration-150 ${category === item ? 'border-ink bg-lime text-ink shadow-brutal-sm' : 'border-ink/15 bg-white text-ink-muted hover:border-ink/50 hover:bg-paper-gray'}`}>
                    {category === item && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{item}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="bounty-description" className="text-sm font-bold text-ink">Scope & deliverables <span className="text-green-700">*</span></label>
                <span className="text-xs tabular-nums text-ink-faint">{description.length} characters</span>
              </div>
              <textarea id="bounty-description" rows={7} value={description} onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain the problem, expected outcome, acceptance criteria, and any technical constraints. A detailed brief helps contributors deliver the right work."
                className="brutalist-input !py-3 text-sm leading-relaxed" minLength={30} required />
            </div>

            <div>
              <label htmlFor="submission-guidelines" className="mb-2 block text-sm font-bold text-ink">How should work be submitted? <span className="font-medium text-ink-faint">Optional</span></label>
              <input id="submission-guidelines" type="text" value={instructions} onChange={(event) => setInstructions(event.target.value)}
                placeholder="For example, a pull request link and short test report" className="brutalist-input !py-3 text-sm" />
            </div>

            <div>
              <label htmlFor="bounty-tags" className="mb-2 block text-sm font-bold text-ink">Skills & tags <span className="font-medium text-ink-faint">Optional · up to 5</span></label>
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-green-900/20 bg-green-50 py-1 pl-3 pr-1 text-xs font-bold text-green-950">
                    {tag}<button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))} aria-label={`Remove ${tag} tag`} className="grid h-5 w-5 place-items-center rounded-full hover:bg-green-100"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <input id="bounty-tags" type="text" value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={handleAddTag}
                placeholder={tags.length === 5 ? 'Tag limit reached' : 'Type a skill and press Enter'} className="brutalist-input !py-3 text-sm" disabled={tags.length >= 5} />
            </div>
          </section>

          <section className="brutalist-card space-y-6 p-5 sm:p-7" aria-labelledby="reward-heading">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime text-ink"><Coins className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted">Step 02 · Set the terms</p>
                <h2 id="reward-heading" className="mt-1 text-lg font-black text-ink">Reward & timeline</h2>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="reward-sol" className="mb-2 block text-sm font-bold text-ink">Reward amount <span className="text-green-700">*</span></label>
                <div className="relative">
                  <input id="reward-sol" type="number" inputMode="decimal" step="0.001" min={CONFIG.minBountySol} max={CONFIG.maxBountySol}
                    value={rewardSol} onChange={(event) => setRewardSol(event.target.value)} placeholder="0.00" className="brutalist-input !py-3 pr-16 text-lg font-black tabular-nums" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-ink-muted">SOL</span>
                </div>
                <p className="mt-2 flex items-center justify-between gap-3 text-xs text-ink-faint">
                  <span>Minimum {CONFIG.minBountySol} SOL</span><span>≈ {solanaService.solToUsd(numRewardSol)}</span>
                </p>
              </div>

              <div>
                <label htmlFor="deadline-days" className="mb-2 block text-sm font-bold text-ink">Delivery deadline <span className="text-green-700">*</span></label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <select id="deadline-days" value={deadlineDays} onChange={(event) => setDeadlineDays(Number(event.target.value))} className="brutalist-input !py-3 !pl-11 text-sm">
                    <option value={3}>3 days · Urgent</option><option value={7}>7 days · One week</option>
                    <option value={14}>14 days · Two weeks</option><option value={30}>30 days · One month</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-ink-faint">Due {new Date(calculatedDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="btn-ghost min-h-12 px-6 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-lime min-h-12 px-6 text-sm disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" /> Waiting for wallet…</> : <><Coins className="h-4 w-4" /> Fund & publish bounty <ArrowUpRight className="h-4 w-4" /></>}
            </button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Bounty preview and funding summary">
          <section aria-labelledby="listing-preview-heading">
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted">Live listing</p><h2 id="listing-preview-heading" className="mt-0.5 text-sm font-black text-ink">Marketplace preview</h2></div>
              <span className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[10px] font-bold text-ink-muted">Contributor view</span>
            </div>
            <article className="group flex min-h-[350px] flex-col overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-brutal-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-brutal">
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={category} size="sm" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-800/20 bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-green-900"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />Open</span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 break-words text-lg font-black leading-snug tracking-tight text-ink">{title.trim() || 'Your bounty title'}</h3>
                  <span className="shrink-0 font-mono text-[10px] text-ink-faint">NEW</span>
                </div>
                <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{description.trim() || 'Your scope and deliverables will appear here. Add enough detail so contributors can understand the work.'}</p>
                <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">
                  {tags.length ? tags.slice(0, 4).map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-paper-gray px-2 py-1 text-[10px] font-semibold text-ink-muted"><Tag className="h-2.5 w-2.5" />{tag}</span>) : <span className="text-[10px] text-ink-faint">Your skill tags will show here</span>}
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-4">
                    <div><span className="text-[10px] font-black uppercase tracking-wider text-ink-faint">Bounty reward</span><div className="mt-1"><SolAmount amount={numRewardSol} size="md" /></div></div>
                    <div className="text-right"><span className="block text-[10px] font-black uppercase tracking-wider text-ink-faint">Deadline</span><span className="mt-1 block text-xs font-bold text-ink">{deadlineDays} days</span></div>
                  </div>
                  <div className="mt-4 flex min-h-10 items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted"><ShieldCheck className="h-3.5 w-3.5" />Funded bounty</span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-ink/20 px-3 py-2 text-xs font-bold text-ink-muted">Claim bounty <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="brutalist-card space-y-4 p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted">Before you publish</p>
              <h2 className="mt-1 text-base font-black text-ink">Funding summary</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="text-ink-muted">Escrow deposit</span><span className="font-black text-ink">{numRewardSol.toFixed(3)} SOL</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-ink-muted">Network fee</span><span className="text-right text-xs font-semibold text-ink-muted">Shown in your wallet</span></div>
              <div className="border-t border-ink/10 pt-3">
                <div className="flex items-center justify-between gap-3"><span className="font-bold text-ink">Estimated balance after</span><span className="font-black text-ink">{balanceAfterFunding.toFixed(3)} SOL</span></div>
                <p className="mt-1 text-right text-[11px] text-ink-faint">Network fee not included</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 rounded-xl border p-3 ${connected ? 'border-green-900/15 bg-green-50' : 'border-ink/10 bg-paper-gray'}`}>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white"><WalletCards className="h-4 w-4 text-ink" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{connected ? 'Connected wallet' : 'Wallet not connected'}</p>
                <p className="truncate text-xs font-black text-ink">{connected ? shortWallet : 'Connect to continue'}</p>
              </div>
              {connected && <span className="h-2 w-2 shrink-0 rounded-full bg-green-600" />}
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-green-900/15 bg-[#eff7e8] p-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-800" />
              <p className="text-xs leading-relaxed text-green-950">The reward is held in the bounty’s on-chain escrow. Your wallet will show the transaction details and network fee before you approve.</p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};
