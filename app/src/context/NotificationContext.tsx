import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  showToast: (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    txHash?: string
  ) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showToast = useCallback(
    (
      type: 'success' | 'error' | 'info' | 'warning',
      title: string,
      message: string,
      txHash?: string
    ) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newNotif: Notification = {
        id,
        type,
        title,
        message,
        txHash,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 6000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
