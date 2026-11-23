import React from 'react';
import { LayoutDashboard, PlusCircle, Compass, Wallet, UserCheck } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAppWallet } from '../context/WalletContext';
import { DashboardTabs } from '../components/dashboard/DashboardTabs';
import { Task } from '../types';

interface DashboardPageProps {
  onSelectTask: (task: Task) => void;
  onClaimTask: (task: Task) => void;
  onCreateClick: () => void;
  onExploreClick: () => void;
  onOpenWalletModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTask,
  onClaimTask,
  onCreateClick,
  onExploreClick,
  onOpenWalletModal,
}) => {
  const { tasks } = useTasks();
  const { connected, publicKeyString } = useAppWallet();

  const createdTasks = tasks.filter((t) => t.creatorAddress === publicKeyString);
  const assignedTasks = tasks.filter((t) => t.workerAddress === publicKeyString);
  const completedTasks = tasks.filter(
    (t) =>
      (t.creatorAddress === publicKeyString || t.workerAddress === publicKeyString) &&
      t.status === 'completed'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-ink" />
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Contributor & Creator Dashboard
            </h1>
          </div>
          <p className="text-xs text-ink-muted font-semibold">
            Track your created bounties, claimed tasks, under-review submissions, and escrow earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreClick}
            className="btn-ghost px-4 py-2.5 text-xs"
          >
            <Compass className="w-4 h-4" />
            Explore Bounties
          </button>

          <button
            onClick={onCreateClick}
            className="btn-lime px-4 py-2.5 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            New Bounty
          </button>
        </div>
      </div>

      {/* Role Banner */}
      {connected ? (
        <div className="brutalist-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime border-2 border-ink shadow-brutal-sm flex items-center justify-center text-ink">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-ink capitalize">
                  Active Wallet
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-paper-gray border border-ink/20 text-ink-muted">
                  {publicKeyString.slice(0, 6)}...{publicKeyString.slice(-4)}
                </span>
              </div>
              <p className="text-[11px] text-ink-faint mt-0.5 font-semibold">
                Dashboard metrics reflect all on-chain actions associated with this address.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenWalletModal}
            className="btn-ghost px-3.5 py-1.5 text-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            Manage Wallet & Faucet
          </button>
        </div>
      ) : (
        <div className="brutalist-card p-4 border-orange-400 flex flex-wrap items-center justify-between gap-4" style={{ background: '#FFF7ED' }}>
          <span className="text-xs text-ink-muted font-semibold">
            Connect your Solana wallet to view your personalized tasks and escrow analytics.
          </span>
          <button
            onClick={onOpenWalletModal}
            className="btn-black px-4 py-2 text-xs"
            style={{ background: '#FF9933', color: '#0D0D0D', borderColor: '#0D0D0D' }}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Tabbed Task Views */}
      <DashboardTabs
        createdTasks={createdTasks}
        assignedTasks={assignedTasks}
        completedTasks={completedTasks}
        onSelectTask={onSelectTask}
        onClaimTask={onClaimTask}
        onCreateClick={onCreateClick}
        onExploreClick={onExploreClick}
      />
    </div>
  );
};
