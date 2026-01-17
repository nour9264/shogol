import * as signalR from '@microsoft/signalr';
import { NOTIFICATION_HUB_URL } from './api';
import type { Notification } from './api';

/**
 * NotificationSignalRService
 * Manages real-time notification delivery via SignalR
 */

// Notification callback type
type NotificationCallback = (notification: Notification) => void;

class NotificationSignalRService {
    private connection: signalR.HubConnection | null = null;
    private notificationListeners: Map<string, NotificationCallback> = new Map();
    private isConnecting = false;

    /**
     * Initialize and connect to notification hub
     * @param token JWT authentication token
     */
    async connect(token: string): Promise<void> {
        if (this.isConnected()) {
            console.log('NotificationHub: Already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('NotificationHub: Connection already in progress');
            return;
        }

        this.isConnecting = true;

        try {
            // Build connection with configuration
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(NOTIFICATION_HUB_URL, {
                    accessTokenFactory: () => token,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                    skipNegotiation: false,
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        // Retry delays: 0ms, 2s, 5s, 10s, 30s, then 30s
                        if (retryContext.previousRetryCount === 0) return 0;
                        if (retryContext.previousRetryCount < 3) return 2000;
                        if (retryContext.previousRetryCount < 5) return 5000;
                        if (retryContext.previousRetryCount < 7) return 10000;
                        return 30000;
                    },
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start connection
            await this.connection.start();
            console.log('✅ NotificationHub Connected!');
        } catch (error: any) {
            // Log error but don't spam console if backend is down
            const isNetworkError = error?.message?.includes('Failed to fetch') ||
                error?.message?.includes('negotiation');
            if (!isNetworkError) {
                console.error('❌ NotificationHub Connection Failed:', error);
            }
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Set up SignalR event handlers
     */
    private setupEventHandlers(): void {
        if (!this.connection) return;

        // Handle incoming notifications
        this.connection.on('ReceiveNotification', (data: any) => {
            console.log('🔔 NotificationHub: New notification received:', data);

            // Map to standardized format
            const notification: Notification = {
                id: data.id || data.Id,
                title: data.title || data.Title,
                message: data.message || data.Message,
                type: data.type || data.Type,
                isRead: data.isRead || data.IsRead || false,
                createdAt: data.createdAt || data.CreatedAt,
                relatedEntityId: data.relatedEntityId || data.RelatedEntityId,
                relatedEntityType: data.relatedEntityType || data.RelatedEntityType,
            };

            this.notifyListeners(notification);
        });

        // Handle reconnecting
        this.connection.onreconnecting((error) => {
            console.warn('🔄 NotificationHub: Reconnecting...', error);
        });

        // Handle reconnected
        this.connection.onreconnected((connectionId) => {
            console.log('✅ NotificationHub: Reconnected:', connectionId);
        });

        // Handle connection closed
        this.connection.onclose((error) => {
            console.error('❌ NotificationHub: Connection closed:', error);
            if (error) {
                console.log('🔄 NotificationHub: Will attempt to reconnect...');
            }
        });
    }

    /**
     * Notify all notification listeners
     */
    private notifyListeners(notification: Notification): void {
        this.notificationListeners.forEach((callback) => {
            try {
                callback(notification);
            } catch (error) {
                console.error('NotificationHub: Error in notification listener:', error);
            }
        });
    }

    /**
     * Subscribe to notifications
     * @param callback Function to call when notification arrives
     * @returns Unsubscribe function
     */
    onNotification(callback: NotificationCallback): () => void {
        const id = Math.random().toString(36).substr(2, 9);
        this.notificationListeners.set(id, callback);

        return () => {
            this.notificationListeners.delete(id);
        };
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Get current connection state
     */
    getConnectionState(): 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected' {
        if (!this.connection) return 'Disconnected';

        switch (this.connection.state) {
            case signalR.HubConnectionState.Connected:
                return 'Connected';
            case signalR.HubConnectionState.Connecting:
                return 'Connecting';
            case signalR.HubConnectionState.Reconnecting:
                return 'Reconnecting';
            case signalR.HubConnectionState.Disconnected:
                return 'Disconnected';
            default:
                return 'Disconnected';
        }
    }

    /**
     * Get the SignalR connection instance
     */
    getConnection(): signalR.HubConnection | null {
        return this.connection;
    }

    /**
     * Disconnect from notification hub
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('NotificationHub: Disconnected');
            } catch (error) {
                console.error('NotificationHub: Error disconnecting:', error);
            }
            this.connection = null;
            this.notificationListeners.clear();
        }
    }
}

// Export singleton instance
export const notificationSignalRService = new NotificationSignalRService();
