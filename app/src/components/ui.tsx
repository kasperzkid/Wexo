import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import { TaskCategory, TaskStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Tab = 'marketplace' | 'dashboard' | 'activity';

export const STATUS_META: Record<
  TaskStatus | 'closed',
  { label: string; badge: string; dot: string; bar: string }
> = {
  open: {
    label: 'Open',
    badge: 'bg-solana-green/10 text-solana-green border-solana-green/25',
    dot: 'bg-solana-green',
    bar: 'bg-solana-green',
  },
  in_progress: {
    label: 'In progress',
    badge: 'bg-sky-400/10 text-sky-300 border-sky-400/25',
    dot: 'bg-sky-400',
    bar: 'bg-sky-400',
  },
  under_review: {
    label: 'Under review',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-violet-400/10 text-violet-300 border-violet-400/25',
    dot: 'bg-violet-400',
    bar: 'bg-violet-400',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    dot: 'bg-slate-500',
    bar: 'bg-slate-500',
  },
  closed: {
    label: 'Closed',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    dot: 'bg-slate-500',
    bar: 'bg-slate-500',
  },
};

export const CATEGORY_META: Record<TaskCategory, { icon: string; tint: string }> = {
  'Solana Dev': { icon: '◈', tint: 'text-solana-purple' },
  'Smart Contracts': { icon: '⌘', tint: 'text-solana-green' },
  'UI/UX Design': { icon: '✦', tint: 'text-pink-400' },
  'Security Audit': { icon: '⬡', tint: 'text-amber-400' },
  'Content & Docs': { icon: '▤', tint: 'text-sky-400' },
  'Full Stack': { icon: '▣', tint: 'text-cyan-300' },
};

export function StatusBadge({ status, className }: { status: TaskStatus | 'closed'; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        meta.badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-sm',
        variant === 'primary' &&
          'bg-gradient-to-r from-solana-purple to-violet-600 text-white shadow-glow-purple hover:brightness-110 active:scale-[0.98]',
        variant === 'secondary' &&
          'bg-navy-750 text-slate-100 border border-white/10 hover:bg-navy-700 active:scale-[0.98]',
        variant === 'outline' &&
          'border border-white/15 text-slate-200 hover:border-solana-green/50 hover:text-solana-green',
        variant === 'ghost' && 'text-slate-400 hover:bg-white/5 hover:text-white',
        variant === 'danger' &&
          'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm sm:py-12">
      <div
        className={cn(
          'glass-panel w-full rounded-2xl shadow-card animate-in',
          maxWidth
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-slate-300">{children}</label>;
}

export const inputClass =
  'glass-input w-full rounded-xl px-3.5 py-2.5 text-sm placeholder:text-slate-600';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
