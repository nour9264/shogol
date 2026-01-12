'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { chatService, ChatMessage, Conversation } from '@/services/api';
import { useChat } from '@/hooks/useSignalR';
import { SignalRMessage, TypingIndicator, ReadReceipt } from '@/services/signalRService';
import { signalRService } from '@/services/signalRService';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import Loading from '@/components/Common/Loading';
import { getImageUrl, formatRelativeTime } from '@/utils/helpers';
import { useToast } from '@/context/ToastContext';
import { FaPaperPlane, FaPaperclip, FaTimes, FaSearch, FaCircle, FaSync, FaCheck, FaCheckDouble } from 'react-icons/fa';

const Messages = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const { error: showError } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SignalR hook for real-time messages
  // Don't filter by conversationId here - we'll filter in the effect
  const { isConnected, connectionState, newMessages, clearMessages } = useChat();

  // Join conversation group when connection is established and conversation is selected
  useEffect(() => {
    if (isConnected && selectedConversation && selectedConversation.id !== -1) {
      signalRService.getConnection()?.invoke('JoinConversation', selectedConversation.id).catch((err) => {
        console.warn('Failed to join conversation group:', err);
      });
    }
  }, [isConnected, selectedConversation]);

  // Load conversations on mount and periodically refresh
  useEffect(() => {
    loadConversations();

    // Refresh conversations every 30 seconds to catch new ones
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle URL parameter for direct messaging
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (!targetUserId) return;

    // Get name and avatar from URL if provided
    const userName = searchParams.get('name');
    const userAvatar = searchParams.get('avatar');

    // If we have a temporary conversation for this user, check if real one exists now
    if (selectedConversation?.id === -1 && selectedConversation?.participantId === targetUserId) {
      const existingConversation = conversations.find(c => c.participantId === targetUserId);
      if (existingConversation) {
        // Replace temporary with real conversation
        setSelectedConversation(existingConversation);
        return;
      }
    }

    // If no conversation selected yet, or selected conversation is for different user
    if (!selectedConversation || selectedConversation.participantId !== targetUserId) {
      // Check if conversation exists in loaded conversations
      const existingConversation = conversations.find(c => c.participantId === targetUserId);
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create temporary conversation immediately (allows user to start typing)
        // This will be replaced with real conversation after first message is sent
        const tempConversation: Conversation = {
          id: -1, // Temporary ID
          participantId: targetUserId,
          participantName: userName || 'User', // Use name from URL if available
          participantAvatar: userAvatar || undefined,
          lastMessage: undefined,
          lastMessageTime: undefined,
          unreadCount: 0,
        };
        setSelectedConversation(tempConversation);
      }
    }
  }, [searchParams, conversations, selectedConversation]);

  // Load messages when conversation is selected and join SignalR group
  useEffect(() => {
    if (selectedConversation) {
      // Skip loading for temporary conversations (new chats)
      if (selectedConversation.id !== -1) {
        loadMessages(selectedConversation.id);

        // Join conversation group for SignalR events (typing, read receipts, etc.)
        if (isConnected) {
          signalRService.getConnection()?.invoke('JoinConversation', selectedConversation.id).catch((err) => {
            console.warn('Failed to join conversation group:', err);
          });
        }
      } else {
        // Temporary conversation - no messages yet
        setMessages([]);
        setLoadingMessages(false);
      }
    } else {
      setMessages([]);
    }

    // Cleanup: Leave conversation group when conversation changes or component unmounts
    return () => {
      if (selectedConversation && selectedConversation.id !== -1 && isConnected) {
        signalRService.getConnection()?.invoke('LeaveConversation', selectedConversation.id).catch((err) => {
          console.warn('Failed to leave conversation group:', err);
        });
      }
    };
  }, [selectedConversation, isConnected]);

  // Handle new real-time messages from SignalR
  useEffect(() => {
    if (newMessages.length === 0) return;

    console.log('📩 Processing', newMessages.length, 'new SignalR messages');

    newMessages.forEach((latestMessage) => {
      console.log('📩 Processing message:', latestMessage);

      // Always update conversation list first
      updateConversationWithNewMessage(latestMessage);

      // Check if this message belongs to the currently selected conversation
      if (selectedConversation) {
        const matchesConversation =
          (selectedConversation.id !== -1 && latestMessage.conversationId === selectedConversation.id) ||
          (selectedConversation.id === -1 && latestMessage.senderId === selectedConversation.participantId);

        if (matchesConversation) {
          console.log('✅ Message matches selected conversation, adding to chat');

          const newChatMessage: ChatMessage = {
            id: latestMessage.messageId,
            conversationId: latestMessage.conversationId,
            senderId: latestMessage.senderId,
            senderName: latestMessage.senderName,
            content: latestMessage.content,
            fileUrl: latestMessage.fileUrl,
            fileName: latestMessage.fileName,
            sentAt: latestMessage.sentAt,
            isRead: false,
          };

          setMessages(prev => {
            // Check for duplicates by message ID
            const isDuplicate = prev.some(m => m.id === newChatMessage.id);
            if (isDuplicate) {
              console.log('⚠️ Duplicate message detected, skipping:', newChatMessage.id);
              return prev;
            }

            // Remove optimistic messages that match this real message
            const filtered = prev.filter(m => {
              // Remove optimistic messages (temporary IDs) that match this real message
              if (m.id > 1000000000000 &&
                m.senderId === newChatMessage.senderId &&
                m.content === newChatMessage.content &&
                Math.abs(new Date(m.sentAt).getTime() - new Date(newChatMessage.sentAt).getTime()) < 10000) {
                console.log('🔄 Replacing optimistic message with real one');
                return false;
              }
              return true;
            });

            // Add the new message
            const updated = [...filtered, newChatMessage];
            console.log('✅ Message added to chat. Total messages:', updated.length);
            return updated;
          });

          // Mark as read for open conversation (skip temporary conversations)
          if (selectedConversation.id !== -1 && latestMessage.conversationId === selectedConversation.id) {
            chatService.markAsRead(selectedConversation.id).catch((err) => {
              console.warn('⚠️ Failed to mark as read:', err);
            });
          }

          // Clear unread count locally
          if (selectedConversation.id !== -1) {
            setConversations(prev =>
              prev.map(c =>
                c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
              )
            );
          }
        } else {
          console.log('ℹ️ Message is for different conversation, updating list only');
        }
      } else {
        console.log('ℹ️ No conversation selected, updating list only');
      }
    });

    // Clear processed messages from the hook after processing
    // This prevents memory buildup and ensures we don't process the same message twice
    clearMessages();
  }, [newMessages, selectedConversation, clearMessages]);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(0);
  const prevLastMessageIdRef = useRef<number | null>(null);

  // Auto-scroll to bottom only when new messages arrive (not on every render)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

    // Only scroll if:
    // 1. Message count increased, OR
    // 2. Last message ID changed (new message added)
    const hasNewMessages =
      currentMessageCount > prevMessageCountRef.current ||
      (lastMessageId !== null && lastMessageId !== prevLastMessageIdRef.current);

    if (hasNewMessages && messages.length > 0) {
      console.log('📜 Auto-scrolling to bottom (new message detected)');
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }

    prevMessageCountRef.current = currentMessageCount;
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages]);

  // Handle typing indicators from SignalR
  useEffect(() => {
    if (!selectedConversation || selectedConversation.id === -1) return;

    const unsubscribe = signalRService.onTyping((typing: TypingIndicator) => {
      if (typing.conversationId === selectedConversation.id && typing.userId !== user?.id) {
        setIsTyping(typing.isTyping);

        // Auto-hide typing indicator after 3 seconds
        if (typing.isTyping) {
          if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
          }
          typingIndicatorTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, [selectedConversation, user?.id]);

  // Handle read receipts from SignalR
  useEffect(() => {
    if (!selectedConversation || selectedConversation.id === -1) return;

    const unsubscribe = signalRService.onReadReceipt((receipt: ReadReceipt) => {
      if (receipt.conversationId === selectedConversation.id) {
        setMessages(prev =>
          prev.map(m =>
            m.id === receipt.messageId ? { ...m, isRead: true } : m
          )
        );
      }
    });

    return unsubscribe;
  }, [selectedConversation]);

  // Handle MessageSent event to stop typing indicators
  useEffect(() => {
    if (!selectedConversation || selectedConversation.id === -1) return;

    const connection = signalRService.getConnection();
    if (!connection) return;

    const handler = (data: { conversationId: number }) => {
      if (data.conversationId === selectedConversation.id) {
        // Stop typing indicator when message is sent
        setIsTyping(false);
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
          typingIndicatorTimeoutRef.current = null;
        }
      }
    };

    connection.on('MessageSent', handler);

    return () => {
      connection.off('MessageSent', handler);
    };
  }, [selectedConversation]);

  // Send typing indicator when user types
  const handleTyping = useCallback(() => {
    if (!selectedConversation || selectedConversation.id === -1 || !isConnected) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    signalRService.sendTypingIndicator(selectedConversation.id, true).catch(() => { });

    // Stop typing indicator after 2 seconds of no typing
    const timeout = setTimeout(() => {
      signalRService.sendTypingIndicator(selectedConversation.id, false).catch(() => { });
    }, 2000);

    setTypingTimeout(timeout);
  }, [selectedConversation, isConnected, typingTimeout]);

  const loadConversations = async () => {
    try {
      console.log('📋 Loading conversations...');
      const response = await chatService.getConversations();
      console.log('📋 Conversations loaded:', response.data);
      const conversationsList = response.data || [];
      setConversations(conversationsList);

      // If we have a URL parameter for a user, try to find the conversation
      const targetUserId = searchParams.get('user');
      if (targetUserId && conversationsList.length > 0) {
        const foundConversation = conversationsList.find(c => c.participantId === targetUserId);
        if (foundConversation) {
          console.log('📋 Found conversation for URL user:', foundConversation);
          setSelectedConversation(prev => {
            // Only update if different conversation
            if (!prev || prev.id !== foundConversation.id) {
              return foundConversation;
            }
            return prev;
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to load conversations:', error);
      showError(error.response?.data?.message || 'فشل تحميل المحادثات');
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: number) => {
    // Skip loading for temporary conversations
    if (conversationId === -1) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      const response = await chatService.getMessages(conversationId);
      console.log('📨 Messages loaded:', response.data?.length || 0, 'messages');
      setMessages(response.data || []);

      // Mark as read
      try {
        await chatService.markAsRead(conversationId);
      } catch (readError) {
        console.warn('⚠️ Failed to mark as read:', readError);
      }

      // Update unread count in conversations
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
      );
    } catch (error: any) {
      console.error('❌ Failed to load messages:', error);
      showError(error.response?.data?.message || 'فشل تحميل الرسائل');
    }
    setLoadingMessages(false);
  };

  const updateConversationWithNewMessage = (message: SignalRMessage) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === message.conversationId);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.content || (message.fileName ? '📎 ' + message.fileName : undefined),
          lastMessageTime: message.sentAt,
          unreadCount: selectedConversation?.id === message.conversationId
            ? 0
            : updated[existingIndex].unreadCount + 1,
        };
        return updated;
      }

      // Reload conversations if new conversation
      loadConversations();
      return prev;
    });
  };

  const scrollToBottom = () => {
    // Scroll only the messages container, not the page or conversations list
    if (messagesEndRef.current) {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        // Scroll to bottom of messages container
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      } else {
        // Fallback: use scrollIntoView but only for messages area
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate inputs
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) {
      showError('يرجى إدخال رسالة أو اختيار ملف');
      return;
    }

    const isTemporaryConversation = selectedConversation.id === -1;
    const receiverId = selectedConversation.participantId;
    const messageContent = newMessage.trim();
    const messageFile = selectedFile;

    // Store current values for optimistic update
    const tempMessageId = Date.now(); // Temporary ID until we get real one from API
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      conversationId: selectedConversation.id !== -1 ? selectedConversation.id : 0,
      senderId: user?.id || '',
      senderName: (user?.firstName && user?.lastName ? user.firstName + ' ' + user.lastName : user?.firstName) || 'You',
      content: messageContent || '',
      fileUrl: messageFile ? URL.createObjectURL(messageFile) : undefined,
      fileName: messageFile?.name,
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    console.log('📤 Sending message:', { receiverId, content: messageContent, hasFile: !!messageFile });
    console.log('📤 Optimistic message:', optimisticMessage);

    // Optimistically add message to UI immediately
    setMessages(prev => {
      const updated = [...prev, optimisticMessage];
      console.log('📤 Messages after optimistic add:', updated.length);
      return updated;
    });
    setNewMessage('');
    setSelectedFile(null);
    setSending(true);

    try {
      console.log('📤 Calling chatService.sendMessage...');
      const response = await chatService.sendMessage({
        receiverId: receiverId,
        content: messageContent || undefined,
        attachment: messageFile || undefined,
      });
      console.log('✅ Message sent successfully:', response.data);

      // Update conversation list immediately
      await loadConversations();

      // If this was a temporary conversation, find and select the real one
      if (isTemporaryConversation) {
        try {
          // Wait a moment for backend to create the conversation
          await new Promise(resolve => setTimeout(resolve, 500));

          const updatedResponse = await chatService.getConversations();
          const updatedConversations = updatedResponse.data || [];
          const newConversation = updatedConversations.find(c => c.participantId === receiverId);

          if (newConversation) {
            console.log('✅ Found new conversation:', newConversation);
            setSelectedConversation(newConversation);
            // Load messages for the new conversation
            await loadMessages(newConversation.id);
          } else {
            console.log('⚠️ Conversation not found yet, will retry...');
            // Retry after a bit more time
            setTimeout(async () => {
              const retryResponse = await chatService.getConversations();
              const retryConversations = retryResponse.data || [];
              const retryConversation = retryConversations.find(c => c.participantId === receiverId);
              if (retryConversation) {
                setSelectedConversation(retryConversation);
                await loadMessages(retryConversation.id);
              }
            }, 1500);
          }
        } catch (reloadError) {
          console.error('❌ Failed to reload conversation:', reloadError);
        }
      } else {
        // For existing conversations, wait for SignalR to deliver the message
        // If SignalR doesn't deliver within 3 seconds, reload from API as fallback
        setTimeout(async () => {
          if (selectedConversation && selectedConversation.id !== -1) {
            setMessages(prev => {
              const hasOptimistic = prev.some(m => m.id === tempMessageId);
              const hasRealMessage = prev.some(m =>
                m.id !== tempMessageId &&
                m.senderId === user?.id &&
                m.content === messageContent &&
                Math.abs(new Date(m.sentAt).getTime() - new Date(optimisticMessage.sentAt).getTime()) < 10000
              );

              // If we still have optimistic message and no real message arrived via SignalR, reload from API
              if (hasOptimistic && !hasRealMessage) {
                console.log('⏳ SignalR message not received within 3s, reloading from API...');
                loadMessages(selectedConversation.id);
              }
              return prev;
            });
          }
        }, 3000);
      }

      // Message will also appear via SignalR, but we've already added it optimistically
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessageId));

      // Restore input values
      setNewMessage(messageContent);
      if (messageFile) {
        setSelectedFile(messageFile);
      }

      const errorMessage = error.response?.data?.message || error.message || 'فشل إرسال الرسالة';
      showError(errorMessage);
    }
    setSending(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
        return;
      }
      setSelectedFile(file);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!c.participantName) return false;
    if (!searchTerm.trim()) return true;
    return c.participantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="h-full overflow-hidden flex transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full shadow-soft overflow-hidden flex h-full transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        <div className="flex h-full w-full">
          {/* Conversations List */}
          <div className="w-full flex flex-col h-full overflow-hidden" style={{ borderLeft: '1px solid rgb(var(--border-primary))' }}>
            {/* Header */}
            <div className="p-4" style={{ borderBottom: '1px solid rgb(var(--border-primary))' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('allMessages')}</h2>
                <button
                  onClick={() => loadConversations()}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: 'rgb(var(--text-secondary))' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--bg-hover))'; e.currentTarget.style.color = 'rgb(var(--primary-500))'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}
                  title={t('refreshConversations')}
                >
                  <FaSync className="text-lg" />
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <FaCircle className="text-xs" />
                <span>
                  {connectionState === 'Connected' ? t('connected') :
                    connectionState === 'Connecting' ? t('connecting') :
                      connectionState === 'Reconnecting' ? t('reconnecting') :
                        t('disconnected')}
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute right-3 text-gray-400" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchHere')}
                  className="input pr-10 py-2 text-sm"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('noConversations')}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 flex items-start gap-3 transition-colors ${isArabic ? 'text-right' : 'text-left'}`}
                    style={{
                      borderBottom: '1px solid rgb(var(--border-primary))',
                      backgroundColor: selectedConversation?.id === conversation.id ? 'rgb(var(--primary-50))' : 'transparent'
                    }}
                    onMouseOver={(e) => { if (selectedConversation?.id !== conversation.id) e.currentTarget.style.backgroundColor = 'rgb(var(--bg-hover))'; }}
                    onMouseOut={(e) => { if (selectedConversation?.id !== conversation.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(conversation.participantAvatar)}
                        alt={conversation.participantName || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                          {conversation.participantName || 'User'}
                        </h3>
                        {conversation.lastMessageTime && (
                          <span className="text-xs whitespace-nowrap mr-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {formatRelativeTime(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm truncate mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 flex items-center justify-between transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderBottom: '1px solid rgb(var(--border-primary))' }}>
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(selectedConversation.participantAvatar)}
                      alt={selectedConversation.participantName || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{selectedConversation.participantName || 'User'}</h3>
                      {isTyping ? (
                        <p className="text-sm italic" style={{ color: 'rgb(var(--text-secondary))' }}>{t('typing')}</p>
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          <FaCircle className="text-xs" />
                          <span>
                            {connectionState === 'Connected' ? 'متصل' :
                              connectionState === 'Connecting' ? 'جاري الاتصال...' :
                                connectionState === 'Reconnecting' ? 'إعادة الاتصال...' :
                                  'غير متصل'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loading />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {t('noMessagesYet')}
                    </div>
                  ) : (
                    [...messages]
                      .sort((a, b) => {
                        const timeA = new Date(a.sentAt).getTime();
                        const timeB = new Date(b.sentAt).getTime();
                        return timeA - timeB;
                      })
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className="rounded-2xl p-4 shadow-sm transition-colors"
                            style={{
                              maxWidth: '500px',
                              backgroundColor: message.senderId === user?.id ? 'rgb(var(--primary-500))' : 'rgb(var(--bg-secondary))',
                              color: message.senderId === user?.id ? 'white' : 'rgb(var(--text-primary))',
                              borderBottomRightRadius: message.senderId === user?.id ? '0.125rem' : '1rem',
                              borderBottomLeftRadius: message.senderId !== user?.id ? '0.125rem' : '1rem'
                            }}
                          >
                            {message.content && (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                            {message.fileUrl && (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 mt-2 text-sm ${message.senderId === user?.id ? 'text-white opacity-90 hover:opacity-100' : 'text-primary-600 hover:text-primary-700'
                                  }`}
                              >
                                <FaPaperclip />
                                <span>{message.fileName || t('attachment')}</span>
                              </a>
                            )}
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <span className={`text-xs ${message.senderId === user?.id ? 'text-white opacity-70' : 'text-gray-500'
                                }`}>
                                {new Date(message.sentAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.senderId === user?.id && (
                                <div className="flex items-center ml-2" title={message.isRead ? t('read') : t('sent')}>
                                  {message.isRead ? (
                                    <div className="relative inline-flex items-center w-4 h-3">
                                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="absolute">
                                        <path d="M1 6L5 10L15 1" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
                                      </svg>
                                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="absolute left-1">
                                        <path d="M1 6L5 10L15 1" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
                                      </svg>
                                    </div>
                                  ) : (
                                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                      <path d="M1 4.5L4.5 8L11 1.5" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-br-sm shadow-sm p-4 transition-colors" style={{ maxWidth: '500px', backgroundColor: 'rgb(var(--bg-secondary))', color: 'rgb(var(--text-primary))' }}>
                        <div className="flex items-center gap-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                          <span>يكتب</span>
                          <span className="animate-pulse">...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderTop: '1px solid rgb(var(--border-primary))' }}>
                  {selectedFile && (
                    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'rgb(var(--bg-hover))' }}>
                      <FaPaperclip style={{ color: 'rgb(var(--text-secondary))' }} />
                      <span className="text-sm flex-1 truncate" style={{ color: 'rgb(var(--text-primary))' }}>{selectedFile.name}</span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <form
                    ref={formRef}
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-full transition-colors"
                      style={{ color: 'rgb(var(--text-secondary))' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgb(var(--bg-hover))'; e.currentTarget.style.color = 'rgb(var(--primary-500))'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}
                    >
                      <FaPaperclip className="text-xl" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                          e.preventDefault();
                          if (!sending && (newMessage.trim() || selectedFile) && selectedConversation) {
                            formRef.current?.requestSubmit();
                          }
                        }
                      }}
                      placeholder={isConnected ? 'إرسال رسالة' : 'جاري الاتصال'}
                      disabled={sending}
                      className="input flex-1 py-3"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!newMessage.trim() && !selectedFile) || !selectedConversation}
                      className="btn btn-primary p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!selectedConversation ? 'اختر محادثة' : (sending ? 'جاري الإرسال' : 'إرسال')}
                    >
                      <FaPaperPlane className={`text-xl ${sending ? 'animate-pulse' : ''}`} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center" style={{ color: 'rgb(var(--text-secondary))' }}>
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4" style={{ color: 'rgb(var(--text-muted))' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-lg">اختر محادثة للبدء</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
