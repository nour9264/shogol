import { useState, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';
import { chatService } from '@/services/api';

/**
 * Hook to track online/offline status of users
 * Combines real-time SignalR updates with API fallback
 */
export const useOnlineStatus = () => {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Subscribe to real-time status updates
    useEffect(() => {
        const unsubscribe = signalRService.onUserStatusChange((status) => {
            console.log('👤 User Status Update:', status);
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                const userId = String(status.userId);

                if (status.isOnline) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }

                return newSet;
            });
        });

        return unsubscribe;
    }, []);

    // Load initial online users from API
    useEffect(() => {
        const loadOnlineUsers = async () => {
            try {
                const response = await chatService.getOnlineUsers();
                const users = response.data.onlineUsers || [];
                setOnlineUsers(new Set(users.map(String)));
                console.log('✅ Loaded online users from API:', users.length);
            } catch (error) {
                console.error('❌ Failed to load online users:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOnlineUsers();
    }, []);

    /**
     * Check if a specific user is online
     * @param userId User ID to check
     * @returns boolean indicating if user is online
     */
    const isUserOnline = (userId: string | undefined): boolean => {
        if (!userId) return false;

        // Normalize user ID for comparison (case-insensitive)
        const normalizedUserId = String(userId).toLowerCase();

        // Check if user is in the online users set (case-insensitive)
        return Array.from(onlineUsers).some(
            (id) => String(id).toLowerCase() === normalizedUserId
        );
    };

    /**
     * Manually refresh a specific user's online status from API
     * @param userId User ID to check
     * @returns Promise<boolean> indicating if user is online
     */
    const refreshUserStatus = async (userId: string): Promise<boolean> => {
        try {
            const response = await chatService.checkUserOnlineStatus(userId);
            const isOnline = response.data.isOnline;

            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                const normalizedUserId = String(userId);

                if (isOnline) {
                    newSet.add(normalizedUserId);
                } else {
                    newSet.delete(normalizedUserId);
                }

                return newSet;
            });

            return isOnline;
        } catch (error) {
            console.error('❌ Failed to refresh user status:', error);
            return false;
        }
    };

    /**
     * Refresh all online users from API
     */
    const refreshAllOnlineUsers = async () => {
        try {
            const response = await chatService.getOnlineUsers();
            const users = response.data.onlineUsers || [];
            setOnlineUsers(new Set(users.map(String)));
            console.log('✅ Refreshed online users from API:', users.length);
        } catch (error) {
            console.error('❌ Failed to refresh online users:', error);
        }
    };

    return {
        onlineUsers: Array.from(onlineUsers),
        onlineUsersSet: onlineUsers,
        isUserOnline,
        refreshUserStatus,
        refreshAllOnlineUsers,
        loading,
    };
};

/**
 * Hook to track a specific user's online status
 * @param userId User ID to track
 */
export const useUserOnlineStatus = (userId: string | undefined) => {
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setIsOnline(false);
            setLoading(false);
            return;
        }

        // Subscribe to status changes
        const unsubscribe = signalRService.onUserStatusChange((status) => {
            const normalizedStatusUserId = String(status.userId).toLowerCase();
            const normalizedUserId = String(userId).toLowerCase();

            if (normalizedStatusUserId === normalizedUserId) {
                setIsOnline(status.isOnline);
            }
        });

        // Load initial status from API
        const loadInitialStatus = async () => {
            try {
                const response = await chatService.checkUserOnlineStatus(userId);
                setIsOnline(response.data.isOnline);
            } catch (error) {
                console.error('❌ Failed to load user online status:', error);
                setIsOnline(false);
            } finally {
                setLoading(false);
            }
        };

        loadInitialStatus();

        return unsubscribe;
    }, [userId]);

    return { isOnline, loading };
};
