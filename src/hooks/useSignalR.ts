'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { signalRService, SignalRMessage, ConnectionState } from '@/services/signalRService';

/**
 * React hook for SignalR connection management
 * Automatically connects when token is available and disconnects on unmount
 */
export const useSignalR = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const connectingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('useSignalR: No auth token found');
      return;
    }

    // Prevent multiple connection attempts
    if (connectingRef.current) return;

    const connect = async () => {
      if (connectingRef.current) return;
      
      connectingRef.current = true;
      try {
        setConnectionState('Connecting');
        await signalRService.connect(token);
        const currentState = signalRService.getConnectionState();
        setConnectionState(currentState);
        setError(null);
        console.log('✅ SignalR connection established:', currentState);
        
        // Clear any pending retry and reset counters
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        sessionStorage.removeItem('signalR_retry_count');
        sessionStorage.removeItem('signalR_cors_error');
      } catch (err: any) {
        const errorMessage = err.message || err.toString() || 'Failed to connect';
        const errorString = JSON.stringify(err).toLowerCase();
        
        // Detect CORS errors more comprehensively
        const isCorsError = errorMessage.includes('CORS') || 
                           errorMessage.includes('Access-Control-Allow-Origin') ||
                           errorMessage.includes('Failed to fetch') ||
                           errorMessage.includes('FailedToNegotiateWithServerError') ||
                           errorString.includes('cors') ||
                           errorString.includes('access-control');
        
        if (isCorsError) {
          console.error('❌ SignalR CORS Error - Backend CORS configuration issue');
          console.error('💡 Backend must set: Access-Control-Allow-Origin: http://localhost:3000 (not *)');
          console.error('💡 And: Access-Control-Allow-Credentials: true');
          setError('CORS Error: Backend configuration required. Chat works but without real-time updates.');
          setConnectionState('Disconnected');
          // Don't retry on CORS errors - they won't resolve without backend fix
          sessionStorage.setItem('signalR_cors_error', 'true');
          connectingRef.current = false;
          return;
        }
        
        console.error('❌ SignalR connection failed:', errorMessage);
        setError(errorMessage);
        setConnectionState('Disconnected');
        
        // Only retry for non-CORS errors, and limit retries to prevent spam
        const retryCount = parseInt(sessionStorage.getItem('signalR_retry_count') || '0');
        if (retryCount < 2 && !retryTimeoutRef.current) {
          sessionStorage.setItem('signalR_retry_count', String(retryCount + 1));
          retryTimeoutRef.current = setTimeout(() => {
            if (!signalRService.isConnected() && !connectingRef.current) {
              console.log(`🔄 Retrying SignalR connection (attempt ${retryCount + 1}/2)...`);
              retryTimeoutRef.current = null;
              connect();
            }
          }, 5000); // 5 second delay
        } else if (retryCount >= 2) {
          console.error('❌ SignalR: Max retries (2) reached. Stopping retry attempts.');
          setError('Connection failed. Chat works but without real-time updates.');
          sessionStorage.removeItem('signalR_retry_count');
        }
      } finally {
        connectingRef.current = false;
      }
    };

    // Subscribe to connection state changes
    const unsubscribeState = signalRService.onConnectionStateChange((state) => {
      console.log('🔄 SignalR state changed:', state);
      setConnectionState(state);
      
      // Only auto-reconnect if not a CORS error
      const hasCorsError = sessionStorage.getItem('signalR_cors_error') === 'true';
      if (state === 'Disconnected' && !connectingRef.current && !hasCorsError) {
        const retryCount = parseInt(sessionStorage.getItem('signalR_retry_count') || '0');
        if (retryCount < 2) {
          console.log('🔄 Connection lost, attempting to reconnect...');
          setTimeout(() => {
            if (!signalRService.isConnected()) {
              connect();
            }
          }, 3000);
        }
      }
    });

    connect();

    // Cleanup on unmount
    return () => {
      unsubscribeState();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      // Don't disconnect on unmount to keep connection alive across pages
      // signalRService.disconnect();
    };
  }, []); // Empty deps - only run once on mount

  return {
    isConnected: connectionState === 'Connected',
    connectionState,
    error,
  };
};

/**
 * React hook for listening to real-time messages
 * @param onMessageReceived Callback function when new message arrives
 */
export const useMessageListener = (onMessageReceived: ((message: SignalRMessage) => void) | null) => {
  const callbackRef = useRef(onMessageReceived);
  callbackRef.current = onMessageReceived;

  useEffect(() => {
    if (!callbackRef.current) return;

    const unsubscribe = signalRService.onMessage((message) => {
      callbackRef.current?.(message);
    });

    return unsubscribe;
  }, []);
};

/**
 * Combined hook for chat functionality
 * Manages connection and message listening
 * Receives ALL messages and lets the component filter them
 */
export const useChat = (conversationId?: number) => {
  const { isConnected, connectionState, error } = useSignalR();
  const [messages, setMessages] = useState<SignalRMessage[]>([]);
  const messagesRef = useRef<SignalRMessage[]>([]);

  // Handle incoming messages - receive ALL messages, don't filter here
  const handleNewMessage = useCallback(
    (message: SignalRMessage) => {
      console.log('📩 useChat: Received message via SignalR:', message);
      
      // Check for duplicates before adding
      const isDuplicate = messagesRef.current.some(
        m => m.messageId === message.messageId && m.conversationId === message.conversationId
      );
      
      if (!isDuplicate) {
        console.log('✅ useChat: Adding new message to queue');
        messagesRef.current = [...messagesRef.current, message];
        setMessages([...messagesRef.current]);
      } else {
        console.log('⚠️ useChat: Duplicate message detected, skipping');
      }
    },
    []
  );

  // Subscribe to real-time messages
  useMessageListener(handleNewMessage);

  // Clear messages when conversation changes (but keep the ref for deduplication)
  useEffect(() => {
    // Don't clear all messages, just reset the state
    // The component will handle filtering
    setMessages([]);
  }, [conversationId]);

  return {
    isConnected,
    connectionState,
    error,
    newMessages: messages,
    clearMessages: () => {
      messagesRef.current = [];
      setMessages([]);
    },
  };
};

