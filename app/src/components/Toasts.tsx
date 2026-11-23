import type React from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Info, X, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';
import { useNotification } from '../context/NotificationContext';
import { getExplorerTxUrl } from '../config/solana';
import { solanaService } from '../services/solanaService';
import { cn } from './ui';

const STYLES: Record<
  Notification['type'],
  { icon: React.ReactNode; border: string; text: string }
> = {
  success: {
    icon: <CheckCircle2 size={17} />,
    border: 'border-solana-green/30',
    text: 'text-solana-green',
  },
  error: { icon: <AlertCircle size={17} />, border: 'border-rose-500/30', text: 'text-rose-300' },
  info: { icon: <Info size={17} />, border: 'border-sky-400/30', text: 'text-sky-300' },
  warning: {
    icon: <AlertTriangle size={17} />,
    border: 'border-amber-400/30',
    text: 'text-amber-300',
  },
};

export function Toasts() {
  const { notifications, dismissToast } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {notifications.map((notification) => {
        const style = STYLES[notification.type];
        return (
          <div
            key={notification.id}
            className={cn(
              'glass-panel pointer-events-auto flex gap-3 rounded-xl border bg-navy-900/95 p-3.5 shadow-card',
              style.border
            )}
          >
            <span className={cn('mt-0.5 shrink-0', style.text)}>{style.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">{notification.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                {notification.message}
              </p>
              {notification.txHash && (
                <a
                  href={getExplorerTxUrl(notification.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] text-violet-300 hover:underline"
                >
                  {solanaService.shortenAddress(notification.txHash)} <ExternalLink size={9} />
                </a>
              )}
            </div>
            <button
              onClick={() => dismissToast(notification.id)}
              className="h-fit rounded p-0.5 text-slate-500 transition hover:text-white"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
