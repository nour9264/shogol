import * as signalR from '@microsoft/signalr';
import { HUB_URL } from './api';

// SignalR message format from backend
export interface SignalRMessage {
  messageId: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  sentAt: string;
  isRead?: boolean; // Read receipt status
}

// Typing indicator event
export interface TypingIndicator {
  conversationId: number;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Read receipt event
export interface ReadReceipt {
  messageId: number;
  conversationId: number;
  readAt: string;
}

// Connection state type
export type ConnectionState = 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected';

// User status update
export interface UserStatusUpdate {
  userId: string;
  isOnline: boolean;
}

// Message callback type
type MessageCallback = (message: SignalRMessage) => void;
type TypingCallback = (typing: TypingIndicator) => void;
type ReadReceiptCallback = (receipt: ReadReceipt) => void;
type UserStatusCallback = (status: UserStatusUpdate) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private messageListeners: Map<string, MessageCallback> = new Map();
  private connectionStateListeners: Map<string, (state: ConnectionState) => void> = new Map();
  private typingListeners: Map<string, TypingCallback> = new Map();
  private readReceiptListeners: Map<string, ReadReceiptCallback> = new Map();
  private userStatusListeners: Map<string, UserStatusCallback> = new Map();

  /**
   * Initialize and connect to SignalR hub
   * @param token JWT authentication token
   */
  async connect(token: string): Promise<void> {
    if (this.isConnected()) {
      console.log('SignalR: Already connected');
      return;
    }

    try {
      // Build connection with configuration
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
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
      console.log('✅ SignalR Connected!');
      this.notifyConnectionStateChange('Connected');
    } catch (error: any) {
      // Log error but don't spam console if backend is down
      const isNetworkError = error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('negotiation');
      if (!isNetworkError) {
        console.error('❌ SignalR Connection Failed:', error);
      }
      this.notifyConnectionStateChange('Disconnected');
      // Still throw so hook can handle it, but app continues to work
      throw error;
    }
  }

  /**
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Handle incoming messages
    this.connection.on('ReceiveMessage', (data: any) => {
      console.log('📩 SignalR: New message received:', data);
      // Map to standardized format
      const message: SignalRMessage = {
        messageId: data.messageId || data.MessageId,
        conversationId: data.conversationId || data.ConversationId,
        senderId: data.senderId || data.SenderId,
        senderName: data.senderName || data.SenderName,
        content: data.content || data.Content,
        fileUrl: data.fileUrl || data.FileUrl,
        fileName: data.fileName || data.FileName,
        sentAt: data.sentAt || data.SentAt,
        isRead: data.isRead || data.IsRead,
      };
      this.notifyMessageListeners(message);
    });

    // Handle typing indicators
    this.connection.on('UserTyping', (data: any) => {
      console.log('⌨️ SignalR: Typing indicator:', data);
      const typing: TypingIndicator = {
        conversationId: data.conversationId || data.ConversationId,
        userId: data.userId || data.UserId,
        userName: data.userName || data.UserName,
        isTyping: data.isTyping !== undefined ? data.isTyping : data.IsTyping,
      };
      this.notifyTypingListeners(typing);
    });

    // Handle read receipts
    this.connection.on('MessageRead', (data: any) => {
      console.log('✓ SignalR: Read receipt:', data);
      const receipt: ReadReceipt = {
        messageId: data.messageId || data.MessageId,
        conversationId: data.conversationId || data.ConversationId,
        readAt: data.readAt || data.ReadAt,
      };
      this.notifyReadReceiptListeners(receipt);
    });

    // Handle User Online/Offline Status (Backend events: UserOnline/UserOffline)
    this.connection.on('UserOnline', (data: any) => {
      console.log('🟢 SignalR: User Online (Raw):', data);
      let userId = '';
      if (typeof data === 'object' && data !== null) {
        userId = data.userId || data.UserId || data.id || data.Id;
      } else {
        userId = String(data);
      }

      if (userId) {
        this.notifyUserStatusListeners({ userId, isOnline: true });
      }
    });

    this.connection.on('UserOffline', (data: any) => {
      console.log('🔴 SignalR: User Offline (Raw):', data);
      let userId = '';
      if (typeof data === 'object' && data !== null) {
        userId = data.userId || data.UserId || data.id || data.Id;
      } else {
        userId = String(data);
      }

      if (userId) {
        this.notifyUserStatusListeners({ userId, isOnline: false });
      }
    });

    // Handle reconnecting
    this.connection.onreconnecting((error) => {
      console.warn('🔄 SignalR: Reconnecting...', error);
      this.notifyConnectionStateChange('Reconnecting');
    });

    // Handle reconnected
    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR: Reconnected:', connectionId);
      this.notifyConnectionStateChange('Connected');
    });

    // Handle connection closed
    this.connection.onclose((error) => {
      console.error('❌ SignalR: Connection closed:', error);
      this.notifyConnectionStateChange('Disconnected');

      // Attempt to reconnect if connection was lost unexpectedly
      // (automatic reconnect should handle this, but this is a fallback)
      if (error) {
        console.log('🔄 SignalR: Attempting to reconnect after error...');
        // The automatic reconnect should handle this, but we log it
      }
    });
  }

  /**
   * Notify all message listeners
   */
  private notifyMessageListeners(message: SignalRMessage): void {
    this.messageListeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('SignalR: Error in message listener:', error);
      }
    });
  }

  /**
   * Notify all typing listeners
   */
  private notifyTypingListeners(typing: TypingIndicator): void {
    this.typingListeners.forEach((callback) => {
      try {
        callback(typing);
      } catch (error) {
        console.error('SignalR: Error in typing listener:', error);
      }
    });
  }

  /**
   * Notify all read receipt listeners
   */
  private notifyReadReceiptListeners(receipt: ReadReceipt): void {
    this.readReceiptListeners.forEach((callback) => {
      try {
        callback(receipt);
      } catch (error) {
        console.error('SignalR: Error in read receipt listener:', error);
      }
    });
  }

  /**
   * Notify all connection state listeners
   */
  private notifyConnectionStateChange(state: ConnectionState): void {
    this.connectionStateListeners.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error('SignalR: Error in connection state listener:', error);
      }
    });
  }

  /**
   * Subscribe to new messages
   * @param callback Function to call when message arrives
   * @returns Unsubscribe function
   */
  onMessage(callback: MessageCallback): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.messageListeners.set(id, callback);

    return () => {
      this.messageListeners.delete(id);
    };
  }

  /**
   * Subscribe to connection state changes
   * @param callback Function to call when state changes
   * @returns Unsubscribe function
   */
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.connectionStateListeners.set(id, callback);

    return () => {
      this.connectionStateListeners.delete(id);
    };
  }

  /**
   * Subscribe to typing indicators
   * @param callback Function to call when typing event occurs
   * @returns Unsubscribe function
   */
  onTyping(callback: TypingCallback): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.typingListeners.set(id, callback);

    return () => {
      this.typingListeners.delete(id);
    };
  }

  /**
   * Subscribe to read receipts
   * @param callback Function to call when read receipt arrives
   * @returns Unsubscribe function
   */
  onReadReceipt(callback: ReadReceiptCallback): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.readReceiptListeners.set(id, callback);

    return () => {
      this.readReceiptListeners.delete(id);
    };
  }

  /**
   * Send typing indicator
   * @param conversationId Conversation ID
   * @param isTyping Whether user is typing
   */
  async sendTypingIndicator(conversationId: number, isTyping: boolean): Promise<void> {
    if (!this.isConnected()) {
      console.warn('SignalR: Cannot send typing indicator - not connected');
      return;
    }

    try {
      await this.connection?.invoke('SendTypingIndicator', conversationId, isTyping);
    } catch (error) {
      console.error('SignalR: Failed to send typing indicator:', error);
    }
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
  getConnectionState(): ConnectionState {
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
   * Get the SignalR connection instance (for invoking methods)
   */
  getConnection(): signalR.HubConnection | null {
    return this.connection;
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR: Disconnected');
      } catch (error) {
        console.error('SignalR: Error disconnecting:', error);
      }
      this.connection = null;
      this.messageListeners.clear();
      this.connectionStateListeners.clear();
      this.typingListeners.clear();
      this.readReceiptListeners.clear();
      this.notifyConnectionStateChange('Disconnected');
    }
  }

  /**
   * Notify all user status listeners
   */
  private notifyUserStatusListeners(status: UserStatusUpdate): void {
    this.userStatusListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('SignalR: Error in user status listener:', error);
      }
    });
  }

  /**
   * Subscribe to user status changes
   * @param callback Function to call when user status changes
   * @returns Unsubscribe function
   */
  onUserStatusChange(callback: UserStatusCallback): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.userStatusListeners.set(id, callback);

    return () => {
      this.userStatusListeners.delete(id);
    };
  }

  /**
   * Check if a user is online via SignalR hub method
   * @param userId User ID to check
   * @returns Promise<boolean> indicating if user is online
   */
  async checkUserOnlineStatus(userId: string): Promise<boolean> {
    if (!this.isConnected()) {
      console.warn('SignalR: Cannot check user status - not connected');
      return false;
    }

    try {
      const isOnline = await this.connection?.invoke('CheckUserOnlineStatus', userId);
      return isOnline || false;
    } catch (error) {
      console.error('SignalR: Failed to check user online status:', error);
      return false;
    }
  }

  // Method 'IsUserOnline' does not exist on backend, relying on events instead.
}

// Export singleton instance
export const signalRService = new SignalRService();

