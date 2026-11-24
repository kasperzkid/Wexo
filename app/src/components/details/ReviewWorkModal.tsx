import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, X, ExternalLink, GitPullRequest, Globe } from 'lucide-react';
import { Task } from '../../types';
import { SolAmount } from '../common/SolAmount';
import { AddressBadge } from '../common/AddressBadge';
import { useAppWallet } from '../../context/WalletContext';

interface ReviewWorkModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (taskId: string) => Promise<unknown>;
}

export const ReviewWorkModal: React.FC<ReviewWorkModalProps> = ({
  task,
  isOpen,
  onClose,
  onApprove,
}) => {
  const { connected, publicKeyString } = useAppWallet();
  const [isApproving, setIsApproving] = useState(false);

  const isPoster = !!connected && !!publicKeyString && !!task && publicKeyString === task.creatorAddress;
  if (!isOpen || !task || !task.submission || !isPoster) return null;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await onApprove(task.id);
      onClose();
    } catch {
      // toast shown in context
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60">
      <div
        className="max-w-lg w-full rounded-2xl p-6 bg-white"
        style={{ border: '2px solid #0D0D0D', boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime border border-ink shadow-brutal-sm flex items-center justify-center text-ink">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Review & Release Escrow</h3>
              <p className="text-xs text-ink-faint font-semibold">Task #{task.onChainId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink p-1 rounded-lg hover:bg-paper-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-paper-gray border border-ink/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-ink-muted">Contributor:</span>
              <AddressBadge address={task.submission.workerAddress} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-ink-muted">Escrow Payout:</span>
              <SolAmount amount={task.rewardSol} size="sm" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-muted">
              Submitted Deliverables
            </h4>

            {task.submission.pullRequestUrl && (
              <a
                href={task.submission.pullRequestUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-paper-gray border border-ink/20 text-xs text-ink-muted hover:border-ink hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{task.submission.pullRequestUrl}</span>
                </div>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}

            {task.submission.liveDemoUrl && (
              <a
                href={task.submission.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-paper-gray border border-ink/20 text-xs text-ink-muted hover:border-ink hover:text-ink transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{task.submission.liveDemoUrl}</span>
                </div>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}

            <div className="p-3 rounded-xl bg-paper-gray border border-ink/20 text-xs text-ink-muted leading-relaxed max-h-36 overflow-y-auto">
              <p className="font-black text-ink mb-1">Notes:</p>
              {task.submission.deliverableNotes}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-lime border border-ink text-xs text-ink flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] font-semibold">
              Approving this work triggers the TaskVault program instruction{' '}
              <code className="bg-white/60 px-1 py-0.5 rounded">approve_work</code>, releasing{' '}
              <strong>{task.rewardSol} SOL</strong> directly from the escrow PDA to the contributor's wallet.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
          <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
            Review Later
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="btn-lime px-5 py-2.5 text-xs"
          >
            {isApproving ? (
              <span>Releasing On-Chain...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Approve & Release {task.rewardSol} SOL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
