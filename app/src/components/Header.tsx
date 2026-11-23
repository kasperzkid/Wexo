import { Activity, Compass, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAppWallet } from '../context/WalletContext';
import { useTasks } from '../context/TaskContext';
import { cn, Tab } from './ui';

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: 'marketplace', label: 'Explore', icon: Compass },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const { publicKeyString } = useAppWallet();
  const { metrics } = useTasks();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-navy-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onTabChange('marketplace')}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-solana-purple to-violet-700 shadow-glow-purple">
            <ShieldCheck size={19} className="text-white" />
          </span>
          <span className="text-left leading-none">
            <span className="block text-base font-extrabold tracking-tight text-white">
              Task<span className="text-gradient-solana">Vault</span>
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Escrow marketplace
            </span>
          </span>
        </button>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  activeTab === item.id
                    ? 'bg-white/[0.06] text-white'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                )}
              >
                <Icon size={15} />
                {item.label}
                {item.id === 'dashboard' && metrics.tasksAwaitingApproval > 0 && (
                  <span className="ml-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {metrics.tasksAwaitingApproval}
                  </span>
                )}
                {activeTab === item.id && (
                  <span className="absolute -bottom-[17px] left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-solana-purple to-solana-green" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-solana-green/20 bg-solana-green/[0.07] px-2.5 py-1 text-[11px] font-semibold text-solana-green sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-solana-green" />
            Devnet
          </span>

          <WalletMultiButton />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.05] px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold',
                activeTab === item.id ? 'bg-white/[0.07] text-white' : 'text-slate-400'
              )}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
        <div className="ml-auto" />
        {publicKeyString && (
          <span className="ml-2 text-[10px] text-slate-500">Wallet ready</span>
        )}
      </nav>
    </header>
  );
}
