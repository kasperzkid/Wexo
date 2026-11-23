import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Task } from '../../types';
import { SolAmount } from '../common/SolAmount';

interface CancelTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (taskId: string) => Promise<unknown>;
}

export const CancelTaskModal: React.FC<CancelTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmCancel(task.id);
      onClose();
    } catch {
      // error handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60">
      <div
        className="max-w-md w-full rounded-2xl p-6 bg-white"
        style={{ border: '2px solid #0D0D0D', boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-500 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Cancel Bounty</h3>
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
          <p className="text-xs text-ink-muted leading-relaxed font-semibold">
            Are you sure you want to cancel this bounty task? Once cancelled, the task will be closed
            and the escrowed funds will be refunded back to your wallet.
          </p>

          <div className="p-3.5 rounded-xl bg-paper-gray border border-ink/20 flex items-center justify-between">
            <span className="text-xs font-black text-ink-muted">Refund Amount:</span>
            <SolAmount amount={task.rewardSol} size="sm" />
          </div>

          <div className="p-3.5 rounded-xl bg-red-50 border border-red-400 text-xs text-red-700 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] font-semibold">
              The Solana program instruction <code className="bg-red-100 px-1 py-0.5 rounded">cancel_task</code> will
              withdraw all remaining escrow lamports and deposit them directly back into your connected wallet.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
          <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
            Keep Bounty
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 text-white border-2 border-red-700 shadow-brutal-sm hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <span>Cancelling...</span> : <span>Confirm Cancellation</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
