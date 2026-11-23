import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { TaskCategory } from '../types';
import { CONFIG } from '../config/solana';
import { useAppWallet } from '../context/WalletContext';
import { useTasks } from '../context/TaskContext';
import { useNotification } from '../context/NotificationContext';
import { Button, cn, FieldLabel, inputClass, Modal } from './ui';

const CATEGORIES: TaskCategory[] = [
  'Solana Dev',
  'Smart Contracts',
  'UI/UX Design',
  'Security Audit',
  'Content & Docs',
  'Full Stack',
];

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

export function CreateTaskModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (taskId: string) => void;
}) {
  const { connected } = useAppWallet();
  const { createTask } = useTasks();
  const { showToast } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Solana Dev');
  const [reward, setReward] = useState('1.0');
  const [deadline, setDeadline] = useState(tomorrow());
  const [tags, setTags] = useState('');
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const rewardSol = Number(reward);
      if (title.trim().length < 5) throw new Error('Title must be at least 5 characters.');
      if (description.trim().length < 20)
        throw new Error('Please describe the task in at least 20 characters.');
      if (!Number.isFinite(rewardSol) || rewardSol < CONFIG.minBountySol || rewardSol > CONFIG.maxBountySol)
        throw new Error(`Reward must be between ${CONFIG.minBountySol} and ${CONFIG.maxBountySol} SOL.`);
      const deadlineIso = new Date(`${deadline}T23:59:59`).toISOString();
      if (new Date(deadlineIso).getTime() <= Date.now())
        throw new Error('Deadline must be in the future.');

      const task = await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        rewardSol,
        deadline: deadlineIso,
        submissionInstructions: instructions.trim() || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 6),
      });

      setTitle('');
      setDescription('');
      setReward('1.0');
      setDeadline(tomorrow());
      setTags('');
      setInstructions('');
      onClose();
      onCreated?.(task.id);
    } catch (error) {
      showToast('error', 'Could not publish task', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a bounty"
      subtitle="Fund an escrow PDA and let contributors compete for your task."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="space-y-4">
        {!connected && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-200">
            <Wallet size={15} /> Connect a wallet (or preview a persona) to publish a task.
          </div>
        )}

        <div>
          <FieldLabel>Task title</FieldLabel>
          <input
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Build a Token-2022 transfer hook"
          />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            className={cn(inputClass, 'min-h-[100px] resize-y')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs to be built, and what does success look like?"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel>Category</FieldLabel>
            <select
              className={inputClass}
              value={category}
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Reward (SOL)</FieldLabel>
            <input
              className={inputClass}
              type="number"
              min={CONFIG.minBountySol}
              max={CONFIG.maxBountySol}
              step="0.1"
              value={reward}
              onChange={(event) => setReward(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Deadline</FieldLabel>
            <input
              className={cn(inputClass, '[color-scheme:dark]')}
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Tags (comma separated)</FieldLabel>
          <input
            className={inputClass}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Anchor, Rust, Token-2022"
          />
        </div>

        <div>
          <FieldLabel>Submission instructions (optional)</FieldLabel>
          <textarea
            className={cn(inputClass, 'min-h-[70px] resize-y')}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="PR link, demo URL, tests to include..."
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
          <p className="text-[11px] text-slate-500">
            {Number(reward || 0) > 0
              ? `≈ ${CONFIG.solPriceUsd * Number(reward)} USD at $${CONFIG.solPriceUsd}/SOL`
              : 'Reward locked in escrow until approval.'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !connected}>
              <Plus size={15} /> {busy ? 'Publishing...' : 'Publish bounty'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
