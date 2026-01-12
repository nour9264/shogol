'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import type { ToastType } from '@/types';
import styles from './Modal.module.css';

interface ModalProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Modal = ({ message, type = 'info', onClose, duration = 7000 }: ModalProps) => {
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasClosedRef = useRef<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(7);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const safeClose = useCallback(() => {
    if (hasClosedRef.current) {
      console.warn(`%c[🔔 MODAL] ⚠️ onClose already called, ignoring duplicate call`, 'color: #FF9800;');
      return;
    }
    hasClosedRef.current = true;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    hasClosedRef.current = false;

    const defaultDuration = type === 'error' ? 7000 : type === 'warning' ? 6000 : 5000;
    const actualDuration = Math.max(duration || defaultDuration, type === 'error' ? 7000 : defaultDuration);

    const now = Date.now();
    startTimeRef.current = now;
    setTimeRemaining(Math.ceil(actualDuration / 1000));

    setTimeout(() => setIsVisible(true), 10);

    if (!actualDuration || actualDuration <= 0) {
      console.warn(`%c[🔔 MODAL] Invalid duration: ${actualDuration}. Modal will stay until manually closed.`, 'color: #FF9800;');
      return;
    }

    if (type === 'error') {
      intervalRef.current = setInterval(() => {
        if (!startTimeRef.current || hasClosedRef.current) return;
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, actualDuration - elapsed);
        const secondsRemaining = Math.ceil(remaining / 1000);
        setTimeRemaining(secondsRemaining);

        if (secondsRemaining % 2 === 0 || secondsRemaining <= 3) {
          console.log(`%c[🔔 MODAL COUNTDOWN] ${secondsRemaining}s remaining: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, 'color: #9C27B0;');
        }

        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 500);
    }

    timerRef.current = setTimeout(() => {
      if (!startTimeRef.current || hasClosedRef.current) return;
      const elapsed = Date.now() - (startTimeRef.current || 0);
      console.log(`%c[🔔 MODAL] ⏰ Timer COMPLETED: Closing modal after ${(elapsed / 1000).toFixed(2)}s`, 'color: #9C27B0; font-weight: bold;');
      safeClose();
    }, actualDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [message, type, duration, safeClose]);

  const handleClose = useCallback(() => {
    if (hasClosedRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    safeClose();
  }, [safeClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const icons = {
    success: <FaCheckCircle size={32} className="text-white" />,
    error: <FaExclamationCircle size={32} className="text-white" />,
    info: <FaInfoCircle size={32} className="text-white" />,
    warning: <FaExclamationTriangle size={32} className="text-white" />,
  };

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      border: 'border-l-4 border-green-700',
      iconBg: 'bg-green-600/20',
    },
    error: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      border: 'border-l-4 border-red-700',
      iconBg: 'bg-red-600/20',
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      border: 'border-l-4 border-blue-700',
      iconBg: 'bg-blue-600/20',
    },
    warning: {
      bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      border: 'border-l-4 border-yellow-700',
      iconBg: 'bg-yellow-600/20',
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.info;
  const titleText = {
    error: '❌ خطأ',
    success: '✅ نجح',
    warning: '⚠️ تحذير',
    info: 'ℹ️ معلومة',
  }[type];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={type !== 'error' ? handleClose : undefined}
      />
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[10001] w-full max-w-lg mx-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
        role="alert"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
      >
        <div
          className={`
            ${currentStyle.bg} ${currentStyle.border}
            rounded-2xl shadow-2xl p-6 md:p-8
            border-t-2 border-b-2 border-r-2 border-white/20
            transform transition-all duration-300
            ${isVisible ? 'scale-100' : 'scale-95'}
            ${type === 'error' ? 'animate-pulse' : ''}
          `}
        >
          <div className="flex items-start gap-4 md:gap-5">
            <div className={`flex-shrink-0 p-3 md:p-4 rounded-xl ${currentStyle.iconBg} backdrop-blur-sm shadow-lg`}>
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xl md:text-2xl mb-2 md:mb-3">{titleText}</h3>
              <p className="text-white font-medium text-base md:text-lg leading-relaxed whitespace-normal break-words mb-2">
                {message}
              </p>
              {type === 'error' && timeRemaining > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                    <span>⏱️</span>
                    <span>يغلق تلقائياً بعد {timeRemaining} ثانية</span>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 md:p-2.5 hover:bg-white/20 rounded-lg transition-all hover:scale-110 active:scale-95 border border-white/20"
              aria-label="إغلاق"
              title="إغلاق"
            >
              <FaTimes size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;

