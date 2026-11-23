import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletAdapterProvider,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CONFIG } from '../config/solana';
import { solanaService } from '../services/solanaService';
import { useNotification } from './NotificationContext';

// Import Solana wallet adapter default styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface CustomWalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  publicKeyString: string;
  balanceSol: number;
  isLoadingBalance: boolean;
  refreshBalance: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (transaction: Transaction) => Promise<string>;
}

const CustomWalletContext = createContext<CustomWalletContextType | undefined>(undefined);

const CustomWalletBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey: realPublicKey, connected: realConnected, disconnect, sendTransaction, wallet: selectedWallet } = useSolanaWallet();
  const { showToast } = useNotification();

  const [balanceSol, setBalanceSol] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);

  const activePublicKey = realPublicKey;

  // Fetch balance from real Devnet
  const refreshBalance = useCallback(async () => {
    if (!activePublicKey) {
      setBalanceSol(0);
      return;
    }
    setIsLoadingBalance(true);
    try {
      const bal = await solanaService.getBalance(activePublicKey);
      setBalanceSol(bal);
    } catch {
      // keep current
    } finally {
      setIsLoadingBalance(false);
    }
  }, [activePublicKey]);

  useEffect(() => {
    localStorage.removeItem('taskvault_sim_role');
    refreshBalance();
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    showToast('info', 'Wallet Disconnected', 'Your wallet has been disconnected');
  }, [disconnect, showToast]);

  const sendWalletTransaction = useCallback(async (transaction: Transaction) => {
    if (!realConnected || !realPublicKey) {
      throw new Error('Connect a Solana wallet to submit this transaction.');
    }
    const connection = solanaService.getConnection();
    if (CONFIG.network !== 'devnet' || !/devnet/i.test(connection.rpcEndpoint)) {
      throw new Error('TaskVault only supports Solana Devnet. Switch the app back to Devnet before signing.');
    }
    const adapter = selectedWallet?.adapter;
    if (adapter && 'wallet' in adapter) {
      const account = adapter.wallet.accounts.find(({ address }) => address === realPublicKey.toBase58());
      if (account && !account.chains.includes('solana:devnet')) {
        throw new Error('This wallet account is not authorized for Solana Devnet. Switch your wallet to Devnet and reconnect.');
      }
    }
    if (transaction.feePayer && !transaction.feePayer.equals(realPublicKey)) {
      throw new Error('The transaction fee payer does not match your connected wallet.');
    }
    const simulation = await connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      throw new Error(
        `Transaction simulation failed: ${simulation.value.err}${simulation.value.logs?.length
          ? `\n${simulation.value.logs.join('\n')}`
          : ''}`
      );
    }
    const signature = await sendTransaction(transaction, connection);
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
    }
    return signature;
  }, [realConnected, realPublicKey, selectedWallet, sendTransaction]);

  return (
    <CustomWalletContext.Provider
      value={{
        connected: realConnected,
        publicKey: activePublicKey,
        publicKeyString: activePublicKey ? activePublicKey.toBase58() : '',
        balanceSol,
        isLoadingBalance,
        refreshBalance,
        disconnectWallet,
        sendTransaction: sendWalletTransaction,
      }}
    >
      {children}
    </CustomWalletContext.Provider>
  );
};

export const CustomWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => CONFIG.endpoint, []);

  // Standard wallets (Phantom, Solflare, Backpack) are auto-detected via Solana Wallet Standard
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletAdapterProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CustomWalletBridge>{children}</CustomWalletBridge>
        </WalletModalProvider>
      </SolanaWalletAdapterProvider>
    </ConnectionProvider>
  );
};

export const useAppWallet = () => {
  const context = useContext(CustomWalletContext);
  if (!context) {
    throw new Error('useAppWallet must be used within CustomWalletProvider');
  }
  return context;
};
