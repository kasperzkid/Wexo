import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      // WalletProvider imports this unconditionally; the app is desktop-browser only.
      '@solana-mobile/wallet-adapter-mobile': new URL(
        './src/shims/solanaMobileWalletAdapter.ts',
        import.meta.url
      ).pathname,
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
