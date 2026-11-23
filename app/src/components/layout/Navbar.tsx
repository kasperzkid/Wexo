import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  PlusCircle,
  Wallet,
  X,
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { useAppWallet } from '../../context/WalletContext';
import { solanaService } from '../../services/solanaService';

type View = 'landing' | 'explore' | 'create' | 'dashboard' | 'details';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: 'landing' | 'explore' | 'create' | 'dashboard') => void;
  onOpenWalletModal: () => void;
}

const NAV_ITEMS = [
  { id: 'explore' as const, label: 'Explore', icon: Compass },
  { id: 'create' as const, label: 'Create', icon: PlusCircle },
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
];

const POPULAR_WALLETS = [
  { name: 'Phantom',      installUrl: 'https://phantom.com/download',      iconUrl: '/wallets/phantom.svg'   },
  { name: 'Solflare',     installUrl: 'https://solflare.com/download',     iconUrl: '/wallets/solflare.svg'  },
  { name: 'Backpack',     installUrl: 'https://backpack.app/download',     iconUrl: '/wallets/backpack.png'  },
  { name: 'MetaMask',     installUrl: 'https://metamask.io/download/',     iconUrl: '/wallets/metamask.svg'  },
  { name: 'Trust Wallet', installUrl: 'https://trustwallet.com/download', iconUrl: '/wallets/trust.svg'     },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenWalletModal }) => {
  const { connected, publicKeyString, balanceSol } = useAppWallet();
  const { wallets, wallet, select, connect, connecting } = useWallet();

  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState<WalletName | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingWalletName || wallet?.adapter.name !== pendingWalletName) return;
    let cancelled = false;
    connect()
      .then(() => {
        if (!cancelled) {
          setPendingWalletName(null);
          setWalletPickerOpen(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPendingWalletName(null);
          setWalletError(error instanceof Error ? error.message : 'Could not connect to this wallet.');
        }
      });
    return () => { cancelled = true; };
  }, [connect, pendingWalletName, wallet]);

  const popularWalletAdapters = POPULAR_WALLETS.map((option) => ({
    ...option,
    adapter: wallets.find((w) => w.adapter.name.toLowerCase().includes(option.name.toLowerCase())),
  }));  const listedNames = new Set(popularWalletAdapters.flatMap((o) => o.adapter ? [o.adapter.adapter.name] : []));
  const otherWalletAdapters = wallets.filter((w) => !listedNames.has(w.adapter.name));

  const openWalletPicker = () => {
    setWalletError(null);
    setPendingWalletName(null);
    setWalletPickerOpen(true);
  };

  const chooseWallet = (name: WalletName) => {
    setWalletError(null);
    setPendingWalletName(name);
    select(name);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">

        {/* ── Brand ── */}
        <button
          onClick={() => onNavigate('landing')}
          className="group flex shrink-0 items-center text-left"
          aria-label="Wexo Home"
        >
          <img
            src="/wexo-neon-lime-tech-logo.png"
            alt="Wexo logo"
            className="h-[3.25rem] w-auto"
          />
        </button>

        {/* ── Divider ── */}
        <span className="hidden h-5 w-px bg-ink/15 md:block" />

        {/* ── Primary nav ── */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (currentView === 'details' && item.id === 'explore');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-lime border border-ink text-ink shadow-brutal-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-gray'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Right side ── */}
        <div className="ml-auto flex items-center gap-2">

          {/* Connected: wallet chip (desktop) */}
          {connected && (
            <button
              onClick={onOpenWalletModal}
              className="hidden items-center gap-2 rounded-lg border border-ink/15 bg-paper-gray px-3 py-1.5 text-left transition-all hover:border-ink/40 hover:bg-paper-mid sm:flex"
            >
              <span className="flex flex-col">
                <span className="font-mono text-[11px] font-bold text-ink leading-none">
                  {solanaService.formatSol(balanceSol, 2)}{' '}
                  <span className="text-ink-faint font-semibold">SOL</span>
                </span>
                <span className="mt-0.5 font-mono text-[10px] text-ink-faint leading-none">
                  {solanaService.shortenAddress(publicKeyString, 4)}
                </span>
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime border border-ink">
                <Wallet className="h-3 w-3 text-ink" />
              </span>
            </button>
          )}

          {/* Connect button */}
          {!connected ? (
            <button
              onClick={openWalletPicker}
              className="inline-flex items-center gap-2 rounded-lg bg-lime border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-brutal-sm transition-all hover:-translate-y-0.5 hover:shadow-brutal active:translate-y-0 active:shadow-brutal-sm"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-1.5 rounded-lg border border-ink bg-lime px-3 py-1.5 text-xs font-bold text-ink shadow-brutal-sm sm:hidden"
            >
              <Wallet className="h-3 w-3" />
              {solanaService.shortenAddress(publicKeyString, 3)}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile nav row ── */}
      <nav className="flex items-center justify-around border-t border-ink/10 bg-paper px-2 py-1.5 md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (currentView === 'details' && item.id === 'explore');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-bold tracking-wide uppercase transition-all ${
                isActive ? 'text-ink' : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${isActive ? 'bg-lime border border-ink shadow-brutal-sm' : ''}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Custom Wallet Picker Modal ── */}
      {walletPickerOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setWalletPickerOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-picker-title"
            className="brutalist-card w-full max-w-lg p-5 sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="wallet-picker-title" className="text-xl font-black text-ink">Connect a wallet</h2>
                <p className="mt-1 text-sm text-ink-muted">Pick a Solana wallet. Installed wallets connect here.</p>
              </div>
              <button
                onClick={() => setWalletPickerOpen(false)}
                aria-label="Close wallet picker"
                className="rounded-lg p-2 text-ink-muted transition hover:bg-paper-gray hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {walletError && (
              <p role="alert" className="mb-3 rounded-lg border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">
                {walletError}
              </p>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {popularWalletAdapters.map((option) => (
                <div key={option.name} className="flex min-w-0 items-center gap-3 rounded-xl border border-ink/15 bg-white p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-gray/60 border border-ink/10 p-1.5 overflow-hidden">
                    <img
                      src={option.adapter?.adapter.icon ?? option.iconUrl}
                      alt={`${option.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{option.name}</span>
                    <span className="block text-[11px] text-ink-muted">
                      {option.adapter ? 'Detected in this browser' : 'Not detected'}
                    </span>
                  </span>
                  {option.adapter ? (
                    <button
                      onClick={() => chooseWallet(option.adapter!.adapter.name)}
                      disabled={connecting || pendingWalletName !== null}
                      className="btn-lime min-w-[76px] rounded-lg px-2.5 py-2 text-xs"
                    >
                      {pendingWalletName === option.adapter.adapter.name
                        ? <LoaderCircle className="h-4 w-4 animate-spin" />
                        : 'Connect'}
                    </button>
                  ) : (
                    <a
                      href={option.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-ink/20 px-2.5 py-2 text-xs font-bold text-ink transition hover:bg-paper-gray"
                    >
                      Install <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {otherWalletAdapters.length > 0 && (
              <div className="mt-4 border-t border-ink/10 pt-4">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Other detected wallets</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {otherWalletAdapters.map((item) => (
                    <button
                      key={item.adapter.name}
                      onClick={() => chooseWallet(item.adapter.name)}
                      disabled={connecting || pendingWalletName !== null}
                      className="flex items-center gap-3 rounded-xl border border-ink/15 bg-white p-3 text-left transition hover:border-ink hover:bg-paper-gray disabled:opacity-50"
                    >
                      <img src={item.adapter.icon} alt="" className="h-9 w-9 rounded-lg" />
                      <span className="flex-1 text-sm font-bold text-ink">{item.adapter.name}</span>
                      {pendingWalletName === item.adapter.name
                        ? <LoaderCircle className="h-4 w-4 animate-spin" />
                        : <span className="text-xs font-bold">Connect</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wallets.length === 0 && (
              <p className="mt-4 rounded-lg bg-paper-gray px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
                Install a wallet extension, enable its Solana support, then refresh this page. Compatible wallets will appear as detected.
              </p>
            )}
          </section>
        </div>,
        document.body
      )}
    </header>
  );
};
