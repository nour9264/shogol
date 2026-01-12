'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateId } from '@/utils/helpers';
import type { Toast, ToastType } from '@/types';

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    if (!message) {
      console.warn(`%c[🔔 TOAST] Attempted to add empty toast message`, 'color: #FF9800;');
      return;
    }

    const id = generateId();
    const timestamp = new Date().toLocaleTimeString();
    const displayDuration = duration / 1000;

    console.log(`%c[🔔 TOAST CONTEXT] ${timestamp} - Adding ${type} toast`, 'color: #FF9800; font-weight: bold;');
    console.log(`%c  Message: ${message}`, 'color: #FF9800;');
    console.log(`%c  Duration: ${displayDuration}s (${duration}ms)`, 'color: #FF9800;');
    console.log(`%c  Toast ID: ${id}`, 'color: #FF9800;');

    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type, duration }];
      console.log(`%c[🔔 TOAST CONTEXT] Total active toasts: ${newToasts.length}`, 'color: #FF9800;');
      return newToasts.slice(-5);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`%c[🔔 TOAST CONTEXT] ${timestamp} - removeToast() called for ID: ${id}`, 'color: #9E9E9E; font-weight: bold;');

    setToasts((prev) => {
      const toastToRemove = prev.find((t) => t.id === id);
      if (toastToRemove) {
        console.log(`%c[🔔 TOAST CONTEXT] Removing toast:`, 'color: #9E9E9E;', {
          id: toastToRemove.id,
          type: toastToRemove.type,
          message: toastToRemove.message.substring(0, 50),
          duration: `${toastToRemove.duration}ms (${(toastToRemove.duration / 1000).toFixed(1)}s)`,
        });
      } else {
        console.warn(`%c[🔔 TOAST CONTEXT] ⚠️ Toast with ID ${id} not found in toasts array!`, 'color: #FF9800;');
      }

      const remaining = prev.filter((toast) => toast.id !== id);
      console.log(`%c[🔔 TOAST CONTEXT] Remaining toasts after removal: ${remaining.length}`, 'color: #9E9E9E;');
      return remaining;
    });
  }, []);

  const success = useCallback(
    (message: string, duration = 5000) => {
      addToast(message, 'success', duration);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration = 7000) => {
      const errorDuration = Math.max(duration, 7000);
      console.log(`%c[🔔 TOAST ERROR] Showing error notification for ${errorDuration}ms: ${message}`, 'color: #F44336; font-weight: bold; font-size: 14px;');
      console.error(`%c[🔔 ERROR MESSAGE] ${message}`, 'color: #F44336; font-weight: bold; font-size: 16px; background: #FFEBEE; padding: 5px; border-radius: 4px;');
      addToast(message, 'error', errorDuration);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration = 5000) => {
      addToast(message, 'info', duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration = 6000) => {
      addToast(message, 'warning', duration);
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

