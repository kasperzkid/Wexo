import React from 'react';
import {
  Wallet,
  X,
  ExternalLink,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  PlusCircle,
  Briefcase,
  FileCheck,
  XCircle,
} from 'lucide-react';
import { useAppWallet } from '../../context/WalletContext';
import { useTasks } from '../../context/TaskContext';
import { solanaService } from '../../services/solanaService';
import { getExplorerAddressUrl, getExplorerTxUrl } from '../../config/solana';
import { TransactionRecord } from '../../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const {
    connected,
    publicKeyString,
    balanceSol,
    isLoadingBalance,
    refreshBalance,
    disconnectWallet,
  } = useAppWallet();

  const { userTransactions, allTransactions } = useTasks();
  const [copied, setCopied] = React.useState(false);
  const [activityFilter, setActivityFilter] = React.useState<'all' | 'my'>(() =>
    userTransactions.length > 0 ? 'my' : 'all'
  );

  // If user transactions update and filter is my with 0 events, but all has events, keep user updated
  React.useEffect(() => {
    if (userTransactions.length > 0 && activityFilter !== 'my') {
      // User has personal transactions
    }
  }, [userTransactions.length]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKeyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedTransactions = activityFilter === 'my' ? userTransactions : allTransactions;

  const getActivityMeta = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'create_task':
        return {
          label: 'Bounty Posted',
          icon: PlusCircle,
          badgeBg: 'bg-lime/40 text-green-900 border-green-700',
        };
      case 'fund_task':
        return {
          label: 'Escrow Funded',
          icon: ArrowUpRight,
          badgeBg: 'bg-paper-mid text-ink-muted border-ink/20',
        };
      case 'claim_task':
        return {
          label: 'Bounty Claimed',
          icon: Briefcase,
          badgeBg: 'bg-blue-100 text-blue-700 border-blue-400',
        };
      case 'submit_work':
        return {
          label: 'Work Submitted',
          icon: FileCheck,
          badgeBg: 'bg-purple-100 text-purple-700 border-purple-400',
        };
      case 'approve_work':
        return {
          label: 'Payment Released',
          icon: ArrowDownLeft,
          badgeBg: 'bg-green-100 text-green-700 border-green-500',
        };
      case 'cancel_task':
        return {
          label: 'Bounty Cancelled',
          icon: XCircle,
          badgeBg: 'bg-red-100 text-red-600 border-red-300',
        };
      case 'airdrop':
        return {
          label: 'Devnet Airdrop',
          icon: ArrowDownLeft,
          badgeBg: 'bg-green-100 text-green-700 border-green-500',
        };
      default:
        return {
          label: (type as string).replace('_', ' '),
          icon: ArrowUpRight,
          badgeBg: 'bg-paper-mid text-ink-muted border-ink/20',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60">
      <div
        className="max-w-4xl w-full rounded-2xl p-6 sm:p-8 bg-white"
        style={{ border: '2px solid #0D0D0D', boxShadow: '6px 6px 0px #0D0D0D' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime border-2 border-ink shadow-brutal-sm flex items-center justify-center text-ink">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Solana Wallet</h3>
              <p className="text-xs text-ink-faint font-semibold">Devnet Cluster Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink p-1 rounded-lg hover:bg-paper-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {connected ? (
          <div className="space-y-6">
            {/* Address Banner */}
            <div className="p-3.5 rounded-xl bg-paper-gray border border-ink/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-ink-faint">
                  Connected Address
                </span>
                <div className="font-mono text-xs text-ink font-semibold">
                  {solanaService.shortenAddress(publicKeyString, 6)}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-paper-mid hover:bg-paper-dark border border-ink/20 text-ink-muted hover:text-ink transition-colors"
                  title="Copy full address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-700" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={getExplorerAddressUrl(publicKeyString)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-paper-mid hover:bg-paper-dark border border-ink/20 text-ink-muted hover:text-ink transition-colors"
                  title="View on Solana Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Balance Card */}
            <div className="p-4 rounded-xl bg-lime border-2 border-ink shadow-brutal-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-ink-soft uppercase font-black">Devnet Balance</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-ink">
                    {solanaService.formatSol(balanceSol, 3)}
                  </span>
                  <span className="text-xs font-black text-ink-muted">SOL</span>
                </div>
                <div className="text-xs text-ink-muted mt-0.5 font-semibold">
                  ≈ {solanaService.solToUsd(balanceSol)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={refreshBalance}
                  disabled={isLoadingBalance}
                  className="btn-ghost px-3 py-1.5 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-black text-ink uppercase tracking-wider">Recent Activity</span>
                <div className="flex items-center rounded-lg bg-paper-gray border border-ink/20 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActivityFilter('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      activityFilter === 'all'
                        ? 'bg-ink text-lime'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    All Activity ({allTransactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('my')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      activityFilter === 'my'
                        ? 'bg-ink text-lime'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    My Wallet ({userTransactions.length})
                  </button>
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {displayedTransactions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-ink-faint bg-paper-gray rounded-xl font-semibold space-y-2">
                    <p>
                      {activityFilter === 'my'
                        ? 'No transactions recorded for this wallet yet.'
                        : 'No bounties or transactions recorded yet.'}
                    </p>
                    {activityFilter === 'my' && allTransactions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityFilter('all')}
                        className="text-[11px] font-black text-green-700 hover:underline"
                      >
                        View {allTransactions.length} platform bounty events →
                      </button>
                    )}
                  </div>
                ) : (
                  displayedTransactions.map((tx) => {
                    const meta = getActivityMeta(tx.type);
                    const IconComponent = meta.icon;
                    const isMine = !!publicKeyString && (tx.fromAddress === publicKeyString || tx.toAddress === publicKeyString);
                    const explorerUrl = tx.txHash
                      ? getExplorerTxUrl(tx.txHash)
                      : tx.toAddress
                      ? getExplorerAddressUrl(tx.toAddress)
                      : tx.fromAddress
                      ? getExplorerAddressUrl(tx.fromAddress)
                      : undefined;

                    return (
                      <div
                        key={tx.id}
                        className="p-2.5 rounded-xl bg-paper-gray border border-ink/20 flex items-center justify-between text-xs transition-colors hover:border-ink/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${meta.badgeBg}`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-ink">
                                {meta.label}
                              </span>
                              {activityFilter === 'all' && tx.fromAddress && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    isMine
                                      ? 'bg-lime text-ink border border-ink/30'
                                      : 'bg-paper-mid text-ink-faint border border-ink/10'
                                  }`}
                                >
                                  {isMine ? 'You' : solanaService.shortenAddress(tx.fromAddress, 4)}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-ink-faint truncate max-w-[220px] sm:max-w-[420px] font-semibold">
                              {tx.taskTitle || 'Bounty Transaction'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          {tx.amountSol !== undefined && tx.amountSol > 0 && (
                            <div className="font-black text-ink">
                              {solanaService.formatSol(tx.amountSol, 2)} SOL
                            </div>
                          )}
                          {explorerUrl ? (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-green-700 hover:underline flex items-center justify-end gap-0.5 font-bold"
                            >
                              <span>Explorer</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-ink-faint font-semibold">Confirmed</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Disconnect Button */}
            <div className="pt-2 border-t border-ink/10">
              <button
                onClick={() => {
                  disconnectWallet();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 border border-red-300 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Current Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-lime border-2 border-ink shadow-brutal-sm text-ink mx-auto flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-ink">No Wallet Connected</h4>
              <p className="text-xs text-ink-muted max-w-xs mx-auto font-semibold">
                Connect Phantom, Solflare, Backpack, Trust Wallet, or another compatible Solana wallet
                to create and claim bounties. MetaMask requires its Solana Connect provider to be available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
