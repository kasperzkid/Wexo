import React from 'react';
import { ShieldCheck, ExternalLink, Github, Twitter, Disc as Discord, Cpu } from 'lucide-react';
import { CONFIG } from '../../config/solana';
import { WexoLogo } from '../common/WexoLogo';

export const Footer: React.FC<{ onNavigate: (v: 'landing' | 'explore' | 'create' | 'dashboard') => void }> = ({
  onNavigate,
}) => {
  return (
    <footer className="border-t border-ink/10 bg-paper-gray text-ink-muted text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <img
              src="/wexo-neon-lime-tech-logo.png"
              alt="Wexo logo"
              className="h-24 w-auto"
            />
            <p className="text-xs text-ink-faint leading-relaxed">
              Get work done. Pay with confidence. Decentralized task bounty marketplace powered by
              Solana on-chain escrow.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {[
                { href: 'https://github.com', icon: Github },
                { href: 'https://x.com', icon: Twitter },
                { href: 'https://discord.com', icon: Discord },
              ].map(({ href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white border border-ink shadow-brutal-sm flex items-center justify-center text-ink hover:bg-lime transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-black text-ink uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Explore Bounties', view: 'explore' as const },
                { label: 'Create New Bounty', view: 'create' as const },
                { label: 'Contributor Dashboard', view: 'dashboard' as const },
              ].map(({ label, view }) => (
                <li key={view}>
                  <button
                    onClick={() => onNavigate(view)}
                    className="hover:text-ink font-semibold transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="https://faucet.solana.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Solana Devnet Faucet
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* On-Chain Security */}
          <div>
            <h4 className="text-xs font-black text-ink uppercase tracking-wider mb-4">On-Chain</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5 text-ink-muted font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-ink" />
                PDA Escrow
              </li>
              <li className="flex items-center gap-1.5 text-ink-muted font-semibold">
                <Cpu className="w-3.5 h-3.5 text-ink" />
                Anchor v0.30
              </li>
              <li>
                <a
                  href={`https://explorer.solana.com/address/${CONFIG.programIdString}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Program Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-faint gap-4">
          <div>© {new Date().getFullYear()} Wexo Protocol. Open Source & Decentralized.</div>
          <div className="flex items-center gap-6 font-semibold">
            <span>Network: Solana Devnet</span>
            <span>Speed: 400ms Slot Time</span>
            <span>Escrow Fee: 0%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
