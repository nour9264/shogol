'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/Common/ProtectedRoute';
import Loading from '@/components/Common/Loading';
import { formatRelativeTime } from '@/utils/helpers';
import { FaBell, FaCheck, FaCheckDouble, FaBriefcase, FaEnvelope, FaUser, FaStar } from 'react-icons/fa';

const Notifications = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { success, error: showError } = useToast();
  const { notifications, loading, markAsRead, markAllAsRead: markAllAsReadHook } = useNotifications();
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllAsReadHook();
      success(t('allNotificationsMarkedAsRead'));
    } catch (error) {
      showError('Failed to mark notifications as read');
    }
    setMarkingAllRead(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.relatedEntityType && notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case 'JobRequest':
          router.push(`/jobs/${notification.relatedEntityId}`);
          break;
        case 'Proposal':
          router.push(`/jobs/${notification.relatedEntityId}`);
          break;
        case 'Message':
        case 'Conversation':
          router.push('/messages');
          break;
        case 'User':
          router.push(`/freelancers/${notification.relatedEntityId}`);
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'JobRequest':
      case 'Proposal':
        return <FaBriefcase className="text-primary-500" />;
      case 'Message':
        return <FaEnvelope className="text-blue-500" />;
      case 'Review':
        return <FaStar className="text-yellow-500" />;
      case 'User':
        return <FaUser className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div
      className={`min-h-screen py-8 transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container-custom max-w-4xl">
        <div className="card transition-colors" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('notificationsTitle')}</h1>
              {unreadCount > 0 && (
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('unreadNotifications').replace('{count}', unreadCount.toString())}
                </p>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
                className="btn btn-outline text-sm flex items-center gap-2"
              >
                <FaCheckDouble />
                {markingAllRead ? t('marking') : t('markAllAsRead')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="text-6xl mx-auto mb-4" style={{ color: 'rgb(var(--text-muted))' }} />
              <p className="text-lg" style={{ color: 'rgb(var(--text-secondary))' }}>{t('noNewNotifications')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  style={{
                    backgroundColor: notification.isRead ? 'rgb(var(--bg-secondary))' : 'rgb(var(--primary-50))',
                    borderColor: notification.isRead ? 'rgb(var(--border-primary))' : 'rgb(var(--primary-200))',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead ? 'rgb(var(--bg-hover))' : 'rgb(var(--primary-100))';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead ? 'rgb(var(--bg-secondary))' : 'rgb(var(--primary-50))';
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: 'rgb(var(--bg-hover))' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold" style={{ color: notification.isRead ? 'rgb(var(--text-secondary))' : 'rgb(var(--text-primary))' }}>
                            {notification.title}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: notification.isRead ? 'rgb(var(--text-muted))' : 'rgb(var(--text-secondary))' }}>
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs mt-2 block" style={{ color: 'rgb(var(--text-muted))' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  );
}
