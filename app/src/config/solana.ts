import { PublicKey } from '@solana/web3.js';

export interface AppConfig {
  network: 'devnet';
  endpoint: string;
  wsEndpoint?: string;
  programId: PublicKey;
  programIdString: string;
  explorerBaseUrl: string;
  faucetUrl: string;
  minBountySol: number;
  maxBountySol: number;
  solPriceUsd: number; // approximate for display
}

// Configured for Solana Devnet
export const CONFIG: AppConfig = {
  network: 'devnet',
  endpoint: 'https://api.devnet.solana.com',
  programIdString: 'G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR',
  programId: new PublicKey('G2mbnQ1yqvt6XJxt7YPXPDLLRfWm798Kxxbk8mHtmzdR'),
  explorerBaseUrl: 'https://explorer.solana.com',
  faucetUrl: 'https://faucet.solana.com',
  minBountySol: 0.05,
  maxBountySol: 100,
  solPriceUsd: 185.50,
};

export const getExplorerAddressUrl = (address: string) => {
  return `${CONFIG.explorerBaseUrl}/address/${address}?cluster=${CONFIG.network}`;
};

export const getExplorerTxUrl = (txHash: string) => {
  return `${CONFIG.explorerBaseUrl}/tx/${txHash}?cluster=${CONFIG.network}`;
};
