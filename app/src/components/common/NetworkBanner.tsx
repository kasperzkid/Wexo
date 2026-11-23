import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CONFIG } from '../../config/solana';

export const NetworkBanner: React.FC = () => {
  return (
    <div className="border-b border-ink/10 bg-paper-gray">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
        {/* Left — network status */}
        <div className="flex items-center gap-2.5 text-ink-muted">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-80" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime border border-ink" />
          </span>
          <span className="font-bold text-ink">Solana Devnet</span>
          <span className="hidden text-ink/20 sm:inline">·</span>
          <span className="hidden sm:inline text-ink-faint">
            All app activity uses Devnet · test SOL only
          </span>
        </div>

        {/* Right — quick links */}
        <div className="flex items-center gap-4">
          <a
            href="https://faucet.solana.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink-muted transition hover:text-ink"
          >
            Get free SOL <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href={`https://explorer.solana.com/address/${CONFIG.programIdString}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-ink-faint transition hover:text-ink"
          >
            Explorer <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
