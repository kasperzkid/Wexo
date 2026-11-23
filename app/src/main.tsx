import { Buffer } from 'buffer';
// Ensure Buffer is available globally for Solana web3.js
(window as any).Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { NotificationProvider } from './context/NotificationContext';
import { CustomWalletProvider } from './context/WalletContext';
import { TaskProvider } from './context/TaskContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NotificationProvider>
      <CustomWalletProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </CustomWalletProvider>
    </NotificationProvider>
  </React.StrictMode>
);
