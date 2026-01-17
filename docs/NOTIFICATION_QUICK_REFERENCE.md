# Notifications Quick Reference Guide

## 🚀 Quick Start

### 1. Display Unread Count Badge

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from '@/components/Common/NotificationComponents';

function MyComponent() {
  const { unreadCount } = useNotifications();
  
  return (
    <div className="relative">
      <FaBell />
      <NotificationBadge count={unreadCount} />
    </div>
  );
}
```

### 2. Show Notification List

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/Common/NotificationComponents';

function NotificationPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  
  return (
    <NotificationList
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      loading={loading}
    />
  );
}
```

### 3. Custom Notification Handling

```tsx
import { useEffect } from 'react';
import { notificationSignalRService } from '@/services/notificationSignalRService';

function MyComponent() {
  useEffect(() => {
    const unsubscribe = notificationSignalRService.onNotification((notification) => {
      // Custom logic here
      console.log('Received:', notification.title);
    });
    
    return unsubscribe;
  }, []);
}
```

## 📦 Available Components

### NotificationBadge
```tsx
<NotificationBadge count={5} />
<NotificationBadge count={unreadCount} className="custom-class" />
```

### NotificationItem
```tsx
<NotificationItem
  notification={notification}
  onMarkAsRead={(id) => markAsRead(id)}
/>
```

### NotificationList
```tsx
<NotificationList
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  loading={loading}
  emptyMessage="No notifications yet"
/>
```

## 🎣 Hook API

### useNotifications()

```typescript
const {
  notifications,      // Notification[] - All notifications
  unreadCount,        // number - Count of unread notifications
  loading,            // boolean - Initial loading state
  isConnected,        // boolean - SignalR connection status
  loadNotifications,  // (page?, size?) => Promise<void>
  loadUnreadCount,    // () => Promise<void>
  markAsRead,         // (id: number) => Promise<void>
  markAllAsRead,      // () => Promise<void>
} = useNotifications();
```

### useNotificationConnection()

```typescript
const {
  isConnected,        // boolean - Connection status
  connectionState,    // 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected'
} = useNotificationConnection();
```

## 🔔 Notification Types

| Type | Title | Icon |
|------|-------|------|
| `AccountCreated` | Welcome to SHOGOL! | 👋 |
| `ProfileUpdated` | Profile Updated | ✏️ |
| `SkillAdded` | Skill Added | 🎯 |
| `JobPosted` | New Job Posted | 📢 |
| `JobCompleted` | Job Completed | ✅ |
| `ProposalSubmitted` | New Proposal Received | 📬 |
| `ProposalAccepted` | Proposal Accepted | ✅ |
| `ProposalRejected` | Proposal Rejected | ❌ |
| `MessageSent` | New Message | 💬 |

## 🌐 API Endpoints

```typescript
// Get notifications
await notificationService.getNotifications(pageNumber, pageSize);

// Get unread count
await notificationService.getUnreadCount();

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();
```

## 🔧 SignalR Service

```typescript
import { notificationSignalRService } from '@/services/notificationSignalRService';

// Subscribe to notifications
const unsubscribe = notificationSignalRService.onNotification((notification) => {
  console.log(notification);
});

// Check connection
const isConnected = notificationSignalRService.isConnected();

// Get connection state
const state = notificationSignalRService.getConnectionState();

// Cleanup
unsubscribe();
```

## 📊 Notification Object

```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}
```

## ✅ Common Patterns

### Pattern 1: Notification Bell with Dropdown

```tsx
function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        <NotificationBadge count={unreadCount} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded">
          <NotificationList
            notifications={notifications.slice(0, 5)}
            onMarkAsRead={markAsRead}
          />
          <Link href="/notifications">View All</Link>
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Auto-refresh Notifications

```tsx
function NotificationPage() {
  const { loadNotifications } = useNotifications();

  useEffect(() => {
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);
}
```

### Pattern 3: Navigate on Notification Click

```tsx
function NotificationItem({ notification }) {
  const router = useRouter();

  const handleClick = () => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on type
    if (notification.type === 'ProposalAccepted') {
      router.push(`/proposals/${notification.relatedEntityId}`);
    } else if (notification.type === 'MessageSent') {
      router.push('/messages');
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {/* Notification content */}
    </div>
  );
}
```

## 🐛 Troubleshooting

### Not receiving notifications?
```typescript
// Check connection status
const { isConnected } = useNotificationConnection();
console.log('Connected:', isConnected);

// Check console for
// ✅ NotificationHub Connected!
```

### Duplicate notifications?
- System prevents duplicates automatically
- Check you're not subscribing multiple times

### Connection keeps dropping?
- Check network stability
- Verify backend is accessible
- Review console for errors

## 📝 Console Messages

**Success:**
- `✅ NotificationHub Connected!`
- `🔔 NotificationHub: New notification received:`
- `✅ Loaded notifications from API:`
- `✅ Marked notification as read:`

**Errors:**
- `❌ NotificationHub Connection Failed:`
- `❌ Failed to load notifications:`
- `❌ Failed to mark notification as read:`

## 🎯 Best Practices

1. ✅ Use `useNotifications()` hook in components
2. ✅ Let `NotificationProvider` manage connection
3. ✅ Mark notifications as read when viewed
4. ✅ Show unread count in header/navigation
5. ✅ Handle different notification types appropriately
6. ❌ Don't manually manage SignalR connection
7. ❌ Don't subscribe to same event multiple times

## 🔗 Related Files

- **Service**: `src/services/notificationSignalRService.ts`
- **Hook**: `src/hooks/useNotifications.ts`
- **Context**: `src/context/NotificationContext.tsx`
- **Components**: `src/components/Common/NotificationComponents.tsx`
- **API**: `src/services/api.ts` (notificationService)
- **Layout**: `src/app/layout.tsx` (NotificationProvider)

## 📚 Full Documentation

For complete documentation, see:
- `docs/NOTIFICATION_INTEGRATION.md` - Full integration guide
- `docs/NOTIFICATION_CHANGES.md` - Summary of changes

---

**Quick Tip:** The notification system is already integrated! Just use the hooks and components in your pages. 🎉
