'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationSignalRService } from '@/services/notificationSignalRService';
import { NotificationToastListener } from '@/components/Common/NotificationComponents';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    isConnected: boolean;
    connectionState: 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected';
}

const NotificationContext = createContext<NotificationContextType>({
    isConnected: false,
    connectionState: 'Disconnected',
});

export const useNotificationConnection = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationConnection must be used within NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected'>('Disconnected');

    // Connect to notification hub when user is authenticated
    useEffect(() => {
        if (!user) {
            // Disconnect if user logs out
            notificationSignalRService.disconnect();
            setIsConnected(false);
            setConnectionState('Disconnected');
            return;
        }

        const connectToHub = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('NotificationProvider: No auth token found');
                return;
            }

            try {
                setConnectionState('Connecting');
                await notificationSignalRService.connect(token);
                setIsConnected(true);
                setConnectionState('Connected');
                console.log('✅ NotificationProvider: Connected to notification hub');
            } catch (error) {
                console.error('NotificationProvider: Failed to connect to notification hub:', error);
                setIsConnected(false);
                setConnectionState('Disconnected');
            }
        };

        connectToHub();

        // Cleanup on unmount
        return () => {
            notificationSignalRService.disconnect();
        };
    }, [user]);

    // Update connection state periodically
    useEffect(() => {
        const updateState = () => {
            const state = notificationSignalRService.getConnectionState();
            setConnectionState(state);
            setIsConnected(state === 'Connected');
        };

        const interval = setInterval(updateState, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{ isConnected, connectionState }}>
            {/* Toast listener for real-time notifications */}
            <NotificationToastListener />
            {children}
        </NotificationContext.Provider>
    );
};
