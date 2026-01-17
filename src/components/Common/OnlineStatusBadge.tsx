'use client';

import React from 'react';
import { FaCircle } from 'react-icons/fa';
import { useUserOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/context/LanguageContext';

interface OnlineStatusBadgeProps {
    userId: string | undefined;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * OnlineStatusBadge Component
 * 
 * Displays a user's online/offline status with real-time updates
 * 
 * @param userId - The user ID to track
 * @param showText - Whether to show "Online"/"Offline" text (default: true)
 * @param size - Size of the indicator (default: 'md')
 * @param className - Additional CSS classes
 * 
 * @example
 * <OnlineStatusBadge userId={user.id} />
 * <OnlineStatusBadge userId={user.id} showText={false} size="sm" />
 */
export const OnlineStatusBadge: React.FC<OnlineStatusBadgeProps> = ({
    userId,
    showText = true,
    size = 'md',
    className = '',
}) => {
    const { isOnline, loading } = useUserOnlineStatus(userId);
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    if (!userId) return null;

    const sizeClasses = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    if (loading) {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <FaCircle className={`${sizeClasses[size]} text-gray-300 animate-pulse`} />
                {showText && (
                    <span className={`${textSizeClasses[size]} text-gray-400`}>
                        {isArabic ? 'جاري التحميل...' : 'Loading...'}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <FaCircle
                className={`${sizeClasses[size]} ${isOnline ? 'text-green-500' : 'text-gray-400'
                    }`}
            />
            {showText && (
                <span
                    className={`${textSizeClasses[size]} font-medium ${isOnline ? 'text-green-500' : 'text-gray-400'
                        }`}
                >
                    {isOnline
                        ? (isArabic ? 'متصل الآن' : 'Online')
                        : (isArabic ? 'غير متصل' : 'Offline')
                    }
                </span>
            )}
        </div>
    );
};

interface OnlineStatusDotProps {
    userId: string | undefined;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

/**
 * OnlineStatusDot Component
 * 
 * Displays a small dot indicator for online status (useful for avatars)
 * 
 * @param userId - The user ID to track
 * @param size - Size of the dot (default: 'md')
 * @param className - Additional CSS classes
 * @param position - Position of the dot relative to parent (default: 'bottom-right')
 * 
 * @example
 * <div className="relative">
 *   <img src={avatar} className="w-12 h-12 rounded-full" />
 *   <OnlineStatusDot userId={user.id} position="bottom-right" />
 * </div>
 */
export const OnlineStatusDot: React.FC<OnlineStatusDotProps> = ({
    userId,
    size = 'md',
    className = '',
    position = 'bottom-right',
}) => {
    const { isOnline, loading } = useUserOnlineStatus(userId);

    if (!userId || loading) return null;

    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    const positionClasses = {
        'top-right': 'top-0 right-0',
        'bottom-right': 'bottom-0 right-0',
        'top-left': 'top-0 left-0',
        'bottom-left': 'bottom-0 left-0',
    };

    return (
        <span
            className={`absolute ${positionClasses[position]} ${sizeClasses[size]} rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                } ${className}`}
            style={{ backgroundColor: isOnline ? 'rgb(34, 197, 94)' : 'rgb(156, 163, 175)' }}
        />
    );
};

export default OnlineStatusBadge;
