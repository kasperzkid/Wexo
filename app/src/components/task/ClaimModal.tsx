import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { SolAmount } from '../common/SolAmount';
import { CountdownTimer } from '../common/CountdownTimer';
import { useAppWallet } from '../../context/WalletContext';

interface ClaimModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: (taskId: string) => Promise<unknown>;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirmClaim,
}) => {
  const { connected } = useAppWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  if (!isOpen || !task) return null;

  const handleClaim = async () => {
    if (!connected) return;
    try {
      setIsSubmitting(true);
      await onConfirmClaim(task.id);
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
        className="max-w-lg w-full rounded-2xl p-6 bg-white"
        style={{ border: '2px solid #0D0D0D', boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime border border-ink shadow-brutal-sm flex items-center justify-center text-ink">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Claim Bounty</h3>
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
          <div>
            <h4 className="text-sm font-black text-ink mb-1">{task.title}</h4>
            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-paper-gray border border-ink/20">
            <div>
              <span className="text-[11px] text-ink-faint uppercase font-black">Guaranteed Reward</span>
              <SolAmount amount={task.rewardSol} size="md" />
            </div>
            <div>
              <span className="text-[11px] text-ink-faint uppercase font-black">Deadline</span>
              <div className="mt-1">
                <CountdownTimer deadline={task.deadline} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-lime border border-ink text-xs text-ink space-y-1.5">
            <div className="font-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Program Escrow Guarantee
            </div>
            <p className="text-ink-soft leading-relaxed text-[11px]">
              {task.rewardSol} SOL is already deposited into the TaskVault Solana program escrow. Once
              your work is submitted and approved by the creator, the program releases payment directly
              to your wallet.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-muted pt-2 font-semibold">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="mt-0.5 rounded border-ink text-ink focus:ring-lime focus:ring-2"
            />
            <span>
              I understand that I am committing to deliver the required deliverables before the deadline.
            </span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
          <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
            Cancel
          </button>
          <button
            onClick={handleClaim}
            disabled={!connected || !agreementChecked || isSubmitting}
            className="btn-lime px-5 py-2.5 text-xs"
          >
            {isSubmitting ? (
              <span>Claiming On-Chain...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Claim Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
