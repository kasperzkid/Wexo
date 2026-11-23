import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Coins,
  Send,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  Globe,
  Tag,
  Clock,
} from 'lucide-react';
import { Task } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { SolAmount } from '../components/common/SolAmount';
import { AddressBadge } from '../components/common/AddressBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { TaskTimeline } from '../components/details/TaskTimeline';
import { ClaimModal } from '../components/task/ClaimModal';
import { SubmitWorkModal } from '../components/details/SubmitWorkModal';
import { ReviewWorkModal } from '../components/details/ReviewWorkModal';
import { CancelTaskModal } from '../components/details/CancelTaskModal';
import { useAppWallet } from '../context/WalletContext';
import { useTasks } from '../context/TaskContext';
import { getExplorerAddressUrl } from '../config/solana';

interface TaskDetailsPageProps {
  taskId: string;
  onBack: () => void;
}

export const TaskDetailsPage: React.FC<TaskDetailsPageProps> = ({ taskId, onBack }) => {
  const { getTaskById, claimTask, submitWork, approveWork, cancelTask } = useTasks();
  const { connected, publicKeyString } = useAppWallet();

  const task = getTaskById(taskId);

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-black text-ink">Task Not Found</h2>
        <p className="text-xs text-ink-muted">The task may have been removed or does not exist.</p>
        <button onClick={onBack} className="btn-black px-5 py-2.5 text-xs">
          Back to Explore
        </button>
      </div>
    );
  }

  const isCreator = publicKeyString === task.creatorAddress;
  const isWorker = publicKeyString === task.workerAddress;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore Bounties
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="brutalist-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CategoryBadge category={task.category} size="md" />
                <span className="font-mono text-xs text-ink-faint">#{task.onChainId}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} size="md" />
                <CountdownTimer deadline={task.deadline} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-snug">
              {task.title}
            </h1>

            <div className="flex flex-wrap gap-2 pt-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-md bg-paper-gray border border-ink/20 text-ink-muted flex items-center gap-1.5 font-semibold"
                >
                  <Tag className="w-3 h-3 text-ink-faint" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description Card */}
          <div className="brutalist-card p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink-muted">
              Task Specification & Scope
            </h3>
            <div className="text-sm text-ink-soft leading-relaxed whitespace-pre-line space-y-3">
              {task.description}
            </div>

            {task.submissionInstructions && (
              <div className="mt-6 pt-6 border-t border-ink/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  Submission Requirements
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed bg-paper-gray p-3.5 rounded-xl border border-ink/20">
                  {task.submissionInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Submission Info */}
          {task.submission && (
            <div className="brutalist-card p-6 sm:p-8 space-y-4" style={{ background: '#FFF7ED' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-orange-700 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submitted Deliverables
                </h3>
                <span className="text-xs text-ink-faint font-semibold">
                  {formatDate(task.submission.submittedAt)}
                </span>
              </div>

              <div className="space-y-3">
                {task.submission.pullRequestUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-ink/20 text-xs">
                    <div className="flex items-center gap-2 text-ink-muted font-semibold">
                      <GitPullRequest className="w-4 h-4 flex-shrink-0" />
                      PR:
                      <span className="truncate max-w-sm font-mono text-ink">
                        {task.submission.pullRequestUrl}
                      </span>
                    </div>
                    <a
                      href={task.submission.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink hover:text-ink-muted p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {task.submission.liveDemoUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-ink/20 text-xs">
                    <div className="flex items-center gap-2 text-ink-muted font-semibold">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      Demo:
                      <span className="truncate max-w-sm font-mono text-ink">
                        {task.submission.liveDemoUrl}
                      </span>
                    </div>
                    <a
                      href={task.submission.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink hover:text-ink-muted p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white border border-ink/20 space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink-faint">
                    Deliverable Notes
                  </span>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {task.submission.deliverableNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain History & Timeline */}
          <div className="brutalist-card p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <Clock className="w-4 h-4" />
              On-Chain Lifecycle & Transaction History
            </h3>
            <p className="text-xs text-ink-faint font-semibold">
              Autonomous state transitions verified by Solana program instructions.
            </p>
            {task.history.length > 0 ? <TaskTimeline history={task.history} /> : (
              <p className="rounded-xl border border-ink/10 bg-paper-gray p-4 text-xs leading-relaxed text-ink-muted">
                Current task status and escrow are read from Devnet. Earlier transaction signatures are not indexed by this app.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Escrow Details, Roles, Actions */}
        <div className="space-y-6">
          {/* Escrow Reward Card */}
          <div
            className="brutalist-card p-6 space-y-5"
            style={{ background: '#F0FFF0', borderColor: '#0D0D0D' }}
          >
            <div>
              <span className="text-[11px] uppercase tracking-wider font-black text-ink-faint">
                Bounty escrow amount
              </span>
              <div className="mt-1">
                <SolAmount amount={task.rewardSol} size="xl" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-lime border border-ink text-xs text-ink flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-semibold">
                'Funds are held in a task-specific PDA. The creator reviews submitted work before approving a payout.'
              </p>
            </div>

            <div className="pt-2 space-y-2">
              {task.status === 'open' && !isCreator && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="btn-lime w-full py-3.5 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Claim Bounty
                </button>
              )}

              {task.status === 'in_progress' && isWorker && (
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="btn-black w-full py-3.5 text-xs"
                  style={{ background: '#FF9933' }}
                >
                  <Send className="w-4 h-4" />
                  Submit Completed Work
                </button>
              )}

              {task.status === 'under_review' && isCreator && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="btn-lime w-full py-3.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Review & Release {task.rewardSol} SOL
                </button>
              )}

              {isCreator && (task.status === 'open' || task.status === 'in_progress') && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-300 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cancel Bounty & Refund Escrow
                </button>
              )}

              {task.status === 'completed' && (
                <div className="p-3 text-center rounded-xl bg-green-100 border border-green-600 text-xs text-green-700 font-black flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Bounty Completed & Payout Released
                </div>
              )}

              {task.status === 'cancelled' && (
                <div className="p-3 text-center rounded-xl bg-red-100 border border-red-500 text-xs text-red-700 font-bold">
                  This task was cancelled and refunded
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="brutalist-card p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-faint">
              Bounty Metadata
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-ink/10">
                <span className="text-ink-muted font-semibold">Creator Wallet</span>
                <AddressBadge address={task.creatorAddress} />
              </div>

              {task.workerAddress && (
                <div className="flex items-center justify-between pb-2.5 border-b border-ink/10">
                  <span className="text-ink-muted font-semibold">Assigned Contributor</span>
                  <AddressBadge address={task.workerAddress} />
                </div>
              )}

              <div className="flex items-center justify-between pb-2.5 border-b border-ink/10">
                <span className="text-ink-muted font-semibold">Deadline</span>
                <span className="text-ink font-bold">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-ink/10">
                <span className="text-ink-muted font-semibold">Created On</span>
                <span className="text-ink font-bold">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Not stored on-chain'}
                </span>
              </div>

              {task.escrowPda && (
                <div className="space-y-1 pt-1">
                  <span className="text-ink-faint text-[11px] font-bold uppercase tracking-wider">
                    Program Escrow PDA
                  </span>
                  <div className="font-mono text-[11px] text-ink-muted truncate bg-paper-gray p-2 rounded-lg border border-ink/20 flex items-center justify-between">
                    <span>{task.escrowPda.slice(0, 20)}...</span>
                    <a
                      href={getExplorerAddressUrl(task.escrowPda)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink hover:text-ink-muted p-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClaimModal
        task={task}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onConfirmClaim={claimTask}
      />
      <SubmitWorkModal
        task={task}
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmitWork={submitWork}
      />
      <ReviewWorkModal
        task={task}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onApprove={approveWork}
      />
      <CancelTaskModal
        task={task}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={cancelTask}
      />
    </div>
  );
};
