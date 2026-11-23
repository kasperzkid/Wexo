import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { getExplorerAddressUrl } from '../../config/solana';
import { solanaService } from '../../services/solanaService';

interface AddressBadgeProps {
  address: string;
  label?: string;
  showAvatar?: boolean;
  truncateChars?: number;
}

export const AddressBadge: React.FC<AddressBadgeProps> = ({
  address,
  label,
  showAvatar = true,
  truncateChars = 4,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarColor = `hsl(${
    address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
  }, 65%, 50%)`;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-ink-muted group">
      {label && <span className="text-ink-faint">{label}:</span>}
      {showAvatar && (
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 border border-ink/20"
          style={{ backgroundColor: avatarColor }}
        />
      )}
      <span className="font-mono text-ink">
        {solanaService.shortenAddress(address, truncateChars)}
      </span>
      <button
        onClick={copyToClipboard}
        title="Copy address"
        className="text-ink-faint hover:text-ink transition-colors p-0.5 rounded"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
        )}
      </button>
      <a
        href={getExplorerAddressUrl(address)}
        target="_blank"
        rel="noreferrer"
        title="View on Solana Explorer"
        className="text-ink-faint hover:text-ink transition-colors p-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
      </a>
    </div>
  );
};
