import React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Send,
  Coins,
  XCircle,
  FileCode,
  Clock,
} from 'lucide-react';
import { TaskHistoryEvent } from '../../types';
import { AddressBadge } from '../common/AddressBadge';
import { getExplorerTxUrl } from '../../config/solana';

interface TaskTimelineProps {
  history: TaskHistoryEvent[];
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({ history }) => {
  const getEventIcon = (type: TaskHistoryEvent['type']) => {
    switch (type) {
      case 'created':
        return <FileCode className="w-4 h-4 text-ink-muted" />;
      case 'funded':
        return <Coins className="w-4 h-4 text-ink" />;
      case 'claimed':
        return <Clock className="w-4 h-4 text-ink-muted" />;
      case 'work_submitted':
        return <Send className="w-4 h-4 text-orange-600" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-700" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-ink-faint" />;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative border-l-2 border-ink/20 ml-3 space-y-6 py-2">
        {history.map((event, index) => {
          return (
            <div key={event.id || index} className="relative pl-6 group">
              {/* Dot */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-ink flex items-center justify-center group-hover:bg-lime transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-ink" />
              </div>

              {/* Event Card */}
              <div className="p-3.5 rounded-xl bg-paper-gray border border-ink/20 hover:border-ink transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="text-xs font-black text-ink uppercase tracking-wide">
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.amountSol && (
                      <span className="text-xs font-bold text-ink bg-lime px-1.5 py-0.5 rounded border border-ink">
                        {event.amountSol} SOL
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-faint font-semibold">{formatTime(event.timestamp)}</span>
                </div>

                {event.note && (
                  <p className="text-xs text-ink-muted leading-relaxed mb-2">{event.note}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/10 text-[11px]">
                  <AddressBadge
                    address={event.actorAddress}
                    label="Actor"
                    truncateChars={4}
                    showAvatar={false}
                  />

                  {event.txHash && (
                    <a
                      href={getExplorerTxUrl(event.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-700 hover:underline flex items-center gap-1 font-mono text-[10px] font-bold"
                    >
                      <span>Solana Tx: {event.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
