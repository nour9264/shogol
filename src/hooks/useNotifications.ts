import { useState, useEffect, useCallback } from 'react';
import { notificationSignalRService } from '@/services/notificationSignalRService';
import { notificationService, Notification } from '@/services/api';

/**
 * Hook for managing real-time notifications
 * Combines SignalR real-time updates with API persistence
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Load initial notifications from API
    const loadNotifications = useCallback(async (pageNumber = 1, pageSize = 20) => {
        try {
            const response = await notificationService.getNotifications(pageNumber, pageSize);
            console.log('📥 Raw API response:', response.data);

            // Handle .NET serialization format ($values array)
            let notificationsList: Notification[] = [];

            if (Array.isArray(response.data)) {
                // Direct array
                notificationsList = response.data;
            } else if (response.data.$values) {
                // .NET serialization format - map to clean objects
                notificationsList = response.data.$values.map((n: any) => ({
                    id: n.id || n.Id,
                    title: n.title || n.Title,
                    message: n.message || n.Message,
                    type: n.type || n.Type,
                    isRead: n.isRead || n.IsRead || false,
                    createdAt: n.createdAt || n.CreatedAt,
                    relatedEntityId: n.relatedEntityId || n.RelatedEntityId,
                    relatedEntityType: n.relatedEntityType || n.RelatedEntityType,
                }));
            } else if (response.data.notifications) {
                // Standard format
                notificationsList = response.data.notifications;
            }

            setNotifications(notificationsList);
            console.log('✅ Loaded notifications from API:', notificationsList.length);
        } catch (error) {
            console.error('❌ Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('❌ Failed to load unread count:', error);
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: number) => {
        // Validate notification ID
        if (!notificationId || isNaN(notificationId)) {
            console.error('❌ Invalid notification ID:', notificationId);
            return;
        }

        try {
            console.log('📝 Marking notification as read:', notificationId);
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );

            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1));

            console.log('✅ Marked notification as read:', notificationId);
        } catch (error) {
            console.error('❌ Failed to mark notification as read:', notificationId, error);
            throw error;
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );

            // Reset unread count
            setUnreadCount(0);

            console.log('✅ Marked all notifications as read');
        } catch (error) {
            console.error('❌ Failed to mark all notifications as read:', error);
            throw error;
        }
    }, []);

    // Subscribe to real-time notifications
    useEffect(() => {
        const unsubscribe = notificationSignalRService.onNotification((notification) => {
            console.log('🔔 Real-time notification received:', notification);

            // Add to notifications list (prepend to show newest first)
            setNotifications(prev => {
                // Check for duplicates
                const exists = prev.some(n => n.id === notification.id);
                if (exists) {
                    console.log('⚠️ Duplicate notification, skipping:', notification.id);
                    return prev;
                }
                return [notification, ...prev];
            });

            // Increment unread count if notification is unread
            if (!notification.isRead) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return unsubscribe;
    }, []);

    // Track connection state
    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(notificationSignalRService.isConnected());
        };

        // Check immediately
        checkConnection();

        // Check periodically
        const interval = setInterval(checkConnection, 5000);

        return () => clearInterval(interval);
    }, []);

    // Load initial data
    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        isConnected,
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        markAllAsRead,
    };
};

/**
 * Hook for connecting to notification hub
 * Should be used at app level (e.g., in layout or main component)
 */
export const useNotificationConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected'>('Disconnected');

    useEffect(() => {
        const connectToHub = async () => {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('useNotificationConnection: No auth token found');
                return;
            }

            try {
                // Connect to notification hub
                await notificationSignalRService.connect(token);
                setIsConnected(true);
                setConnectionState('Connected');
            } catch (error) {
                console.error('Failed to connect to notification hub:', error);
                setIsConnected(false);
                setConnectionState('Disconnected');
            }
        };

        connectToHub();

        // Cleanup on unmount
        return () => {
            notificationSignalRService.disconnect();
        };
    }, []);

    // Update connection state periodically
    useEffect(() => {
        const updateState = () => {
            const state = notificationSignalRService.getConnectionState();
            setConnectionState(state);
            setIsConnected(state === 'Connected');
        };

        const interval = setInterval(updateState, 2000);
        return () => clearInterval(interval);
    }, []);

    return {
        isConnected,
        connectionState,
    };
};
