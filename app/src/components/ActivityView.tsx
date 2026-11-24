import { ExternalLink, History } from 'lucide-react';
import { TransactionRecord } from '../types';
import { getExplorerTxUrl } from '../config/solana';
import { useTasks } from '../context/TaskContext';
import { solanaService } from '../services/solanaService';
import { EmptyState, STATUS_META } from './ui';

const TYPE_LABEL: Record<TransactionRecord['type'], string> = {
  create_task: 'Bounty posted',
  fund_task: 'Escrow funded',
  claim_task: 'Bounty claimed',
  submit_work: 'Work submitted',
  approve_work: 'Payment released',
  cancel_task: 'Refund issued',
  airdrop: 'Devnet airdrop',
};

export function ActivityView() {
  const { userTransactions } = useTasks();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">On-chain activity</h1>
        <p className="mt-1 text-sm text-slate-400">
          Escrow, claim and payout events recorded for the connected wallet.
        </p>
      </div>

      {userTransactions.length === 0 ? (
        <EmptyState
          icon={<History size={22} />}
          title="No transactions yet"
          description="Create, claim or complete a bounty and its transactions will appear here."
        />
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Task</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Signature</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-solana-green" />
                        <span className="text-xs font-semibold text-slate-200">
                          {TYPE_LABEL[tx.type]}
                        </span>
                      </div>
                      <span className="mt-1 block text-[10px] capitalize text-slate-500">
                        {tx.status}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-xs text-slate-400">
                      {tx.taskTitle || '—'}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-solana-green">
                      {tx.amountSol ? `${solanaService.formatSol(tx.amountSol)} SOL` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={getExplorerTxUrl(tx.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-violet-300 hover:underline"
                      >
                        {solanaService.shortenAddress(tx.txHash, 6)} <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-600">
        Explorer links point to Solana Devnet · Cluster status shown in the header
      </p>
    </section>
  );
}
