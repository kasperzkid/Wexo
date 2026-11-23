import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { CONFIG } from '../config/solana';

class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(CONFIG.endpoint, 'confirmed');
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public async getBalance(pubkey: PublicKey): Promise<number> {
    try {
      const lamports = await this.connection.getBalance(pubkey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (err) {
      console.warn('Failed to fetch SOL balance:', err);
      return 0;
    }
  }

  public shortenAddress(address?: string | null, chars = 4): string {
    if (!address) return '';
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  public formatSol(amount: number, maxDecimals = 3): string {
    const minDigits = Math.min(2, Math.max(0, maxDecimals));
    const maxDigits = Math.max(minDigits, maxDecimals);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount || 0);
  }

  public solToUsd(amount: number): string {
    const usd = (amount || 0) * CONFIG.solPriceUsd;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(usd);
  }

  public getDaysRemaining(deadlineIso: string): { text: string; isPast: boolean; days: number; hours: number } {
    const diffMs = new Date(deadlineIso).getTime() - Date.now();
    if (diffMs <= 0) {
      return { text: 'Expired', isPast: true, days: 0, hours: 0 };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h left`, isPast: false, days, hours };
    }
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}h ${minutes}m left`, isPast: false, days: 0, hours };
  }
}

export const solanaService = new SolanaService();
