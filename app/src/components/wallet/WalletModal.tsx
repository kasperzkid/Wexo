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
} from 'lucide-react';
import { useAppWallet } from '../../context/WalletContext';
import { useTasks } from '../../context/TaskContext';
import { solanaService } from '../../services/solanaService';
import { getExplorerAddressUrl, getExplorerTxUrl } from '../../config/solana';

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

  const { userTransactions } = useTasks();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKeyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60">
      <div
        className="max-w-lg w-full rounded-2xl p-6 bg-white"
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
          <div className="space-y-5">
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

            {/* Recent Wallet Transactions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-ink uppercase tracking-wider">Recent Activity</span>
                <span className="text-[11px] text-ink-faint font-semibold">
                  {userTransactions.length} events
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {userTransactions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-ink-faint bg-paper-gray rounded-xl font-semibold">
                    No transactions recorded yet
                  </div>
                ) : (
                  userTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-paper-gray border border-ink/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {tx.type === 'approve_work' || tx.type === 'airdrop' ? (
                          <div className="w-6 h-6 rounded-lg bg-green-100 border border-green-500 text-green-700 flex items-center justify-center">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-paper-mid border border-ink/20 text-ink-muted flex items-center justify-center">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-black text-ink capitalize">
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="text-[10px] text-ink-faint truncate max-w-[140px] font-semibold">
                            {tx.taskTitle || 'Bounty Transaction'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {tx.amountSol && (
                          <div className="font-black text-ink">
                            {solanaService.formatSol(tx.amountSol, 2)} SOL
                          </div>
                        )}
                        <a
                          href={getExplorerTxUrl(tx.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-green-700 hover:underline flex items-center justify-end gap-0.5 font-bold"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))
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
