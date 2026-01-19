'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const OfflineToast = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const { t, isArabic } = useLanguage();

    useEffect(() => {
        // Set initial online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowToast(true);
            // Hide the "back online" toast after 3 seconds
            setTimeout(() => setShowToast(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowToast(true);
            // Keep offline toast visible until back online
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't show toast if online and not transitioning
    if (isOnline && !showToast) return null;

    return (
        <div
            className={`fixed bottom-4 ${isArabic ? 'right-4' : 'left-4'} z-[9999] transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
            style={{
                maxWidth: '400px',
            }}
        >
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border ${isOnline
                    ? 'bg-green-500/90 border-green-400 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
            >
                {/* Icon */}
                <div className="flex-shrink-0">
                    {isOnline ? (
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-6 h-6 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                            />
                        </svg>
                    )}
                </div>

                {/* Message */}
                <div className="flex-1">
                    <p
                        className={`text-sm font-medium ${isOnline ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}
                    >
                        {isOnline
                            ? isArabic
                                ? 'عدت متصلاً بالإنترنت'
                                : 'You are back online'
                            : isArabic
                                ? 'أنت غير متصل حالياً'
                                : 'You are currently offline'}
                    </p>
                    {!isOnline && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {isArabic
                                ? 'بعض الميزات قد لا تكون متاحة'
                                : 'Some features may be unavailable'}
                        </p>
                    )}
                </div>

                {/* Close button */}
                {isOnline && (
                    <button
                        onClick={() => setShowToast(false)}
                        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default OfflineToast;
