import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getExplorerTxUrl } from '../../config/solana';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissToast } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {notifications.map((notif) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-ink-muted flex-shrink-0" />,
        };

        const styles = {
          success: 'bg-green-50 border-green-700',
          error: 'bg-red-50 border-red-600',
          warning: 'bg-orange-50 border-orange-500',
          info: 'bg-white border-ink',
        };

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto rounded-xl border-2 p-4 shadow-brutal transition-all duration-300 flex items-start justify-between gap-3 ${styles[notif.type]}`}
          >
            <div className="flex items-start gap-3">
              {icons[notif.type]}
              <div className="space-y-1">
                <h5 className="text-xs font-black text-ink tracking-wide">{notif.title}</h5>
                <p className="text-xs text-ink-muted leading-relaxed">{notif.message}</p>
                {notif.txHash && (
                  <a
                    href={getExplorerTxUrl(notif.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 hover:underline mt-1"
                  >
                    View on Solana Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => dismissToast(notif.id)}
              className="text-ink-faint hover:text-ink transition-colors p-1 rounded-md hover:bg-ink/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
