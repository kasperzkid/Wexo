/**
 * Lightweight desktop-only stand-in for @solana-mobile/wallet-adapter-mobile.
 * The app is used in a browser on desktop; WalletProvider still imports this
 * module unconditionally. Stubbing it avoids pulling an incompatible nested
 * @solana/kit copy into the Vite browser bundle.
 */
export const SolanaMobileWalletAdapterWalletName = 'Solana Mobile Wallet Adapter';

export const createDefaultAddressSelector = () => async () => null;

export const createDefaultAuthorizationResultCache = () => ({
  get: async () => null,
  set: async () => undefined,
});

export const createDefaultWalletNotFoundHandler = () => () => undefined;

export class SolanaMobileWalletAdapter {
  name = SolanaMobileWalletAdapterWalletName;
  readyState = 'Unsupported';
  url = 'https://solana.com';
  icon = '';

  constructor(_config?: unknown) {}

  async connect() {
    throw new Error('Mobile wallet adapter is not available in this browser build.');
  }

  async autoConnect() {
    throw new Error('Mobile wallet adapter is not available in this browser build.');
  }

  async disconnect() {}

  on() {}
  off() {}
}
