'use client';

import React, { useEffect, useState } from 'react';
import { notificationSignalRService } from '@/services/notificationSignalRService';
import type { Notification } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * NotificationToastListener Component
 * 
 * Listens for real-time notifications via SignalR and displays them as toasts
 * Should be placed at the app level (e.g., in layout.tsx)
 */
export const NotificationToastListener: React.FC = () => {
    const { success, error, info } = useToast();
    const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

    useEffect(() => {
        const unsubscribe = notificationSignalRService.onNotification((notification) => {
            // Prevent duplicate toasts
            if (notification.id === lastNotificationId) {
                return;
            }
            setLastNotificationId(notification.id);

            // Show toast based on notification type
            const message = `${notification.title}\n${notification.message}`;

            // Determine toast type based on notification type
            const notificationType = notification.type.toLowerCase();

            if (notificationType.includes('accepted') || notificationType.includes('completed') || notificationType.includes('success')) {
                success(message);
            } else if (notificationType.includes('rejected') || notificationType.includes('error') || notificationType.includes('failed')) {
                error(message);
            } else {
                info(message);
            }

            console.log('🔔 Notification toast displayed:', notification.title);
        });

        return unsubscribe;
    }, [lastNotificationId, success, error, info]);

    return null; // This component doesn't render anything
};

interface NotificationBadgeProps {
    count: number;
    className?: string;
}

/**
 * NotificationBadge Component
 * 
 * Displays unread notification count
 * 
 * @param count - Number of unread notifications
 * @param className - Additional CSS classes
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
    if (count === 0) return null;

    return (
        <span
            className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 ${className}`}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: number) => void;
    onClose?: () => void;
}

/**
 * NotificationItem Component
 * 
 * Displays a single notification
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onClose
}) => {
    const getIcon = () => {
        const type = notification.type.toLowerCase();

        if (type.includes('accepted') || type.includes('completed') || type.includes('success')) {
            return <FaCheckCircle className="text-green-500" />;
        } else if (type.includes('rejected') || type.includes('error') || type.includes('failed')) {
            return <FaExclamationCircle className="text-red-500" />;
        } else {
            return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className={`p-4 border-b transition-colors ${notification.isRead ? 'bg-transparent' : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
            style={{ borderColor: 'rgb(var(--border-primary))' }}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4
                            className="font-semibold text-sm"
                            style={{ color: 'rgb(var(--text-primary))' }}
                        >
                            {notification.title}
                        </h4>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <FaTimes className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }} />
                            </button>
                        )}
                    </div>
                    <p
                        className="text-sm mt-1"
                        style={{ color: 'rgb(var(--text-secondary))' }}
                    >
                        {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <span
                            className="text-xs"
                            style={{ color: 'rgb(var(--text-tertiary))' }}
                        >
                            {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && onMarkAsRead && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NotificationListProps {
    notifications: Notification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    loading?: boolean;
    emptyMessage?: string;
}

/**
 * NotificationList Component
 * 
 * Displays a list of notifications
 */
export const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    loading = false,
    emptyMessage = 'No notifications',
}) => {
    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Loading notifications...
                </p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center">
                <FaBell className="text-4xl mx-auto mb-4" style={{ color: 'rgb(var(--text-tertiary))' }} />
                <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {emptyMessage}
                </p>
            </div>
        );
    }

    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div>
            {hasUnread && onMarkAllAsRead && (
                <div className="p-3 border-b flex justify-end" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                        Mark all as read
                    </button>
                </div>
            )}
            <div className="max-h-[500px] overflow-y-auto">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={onMarkAsRead}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationToastListener;
