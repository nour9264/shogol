# Real-Time Notifications Integration - Frontend Implementation

## Overview
This document describes the frontend implementation of the real-time notification system using SignalR and REST API.

## Backend Events

The backend sends notifications via the **`ReceiveNotification`** event through the `/notificationHub` SignalR hub.

### Notification Types

| Event Type | Title | Description |
|------------|-------|-------------|
| `AccountCreated` | Welcome to SHOGOL! 👋 | User account created |
| `ProfileUpdated` | Profile Updated ✏️ | User profile updated |
| `SkillAdded` | Skill Added 🎯 | New skill added to profile |
| `JobPosted` | New Job Posted 📢 | New job request posted |
| `JobCompleted` | Job Completed ✅ | Job marked as completed |
| `ProposalSubmitted` | New Proposal Received 📬 | New proposal received |
| `ProposalAccepted` | Proposal Accepted ✅ | Proposal accepted |
| `ProposalRejected` | Proposal Rejected ❌ | Proposal rejected |
| `MessageSent` | New Message 💬 | New chat message received |

## API Endpoints

### Get All Notifications
```
GET /api/Notification/my-notifications?pageNumber=1&pageSize=20
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "Proposal Accepted ✅",
      "message": "Your proposal has been accepted",
      "type": "ProposalAccepted",
      "isRead": false,
      "createdAt": "2026-01-13T10:30:00Z",
      "relatedEntityId": 123,
      "relatedEntityType": "Proposal"
    }
  ],
  "totalCount": 50,
  "pageNumber": 1,
  "pageSize": 20
}
```

### Get Unread Count
```
GET /api/Notification/unread-count
```

**Response:**
```json
{
  "unreadCount": 5
}
```

### Mark Notification as Read
```
PUT /api/Notification/{notificationId}/read
```

**Response:**
```json
{
  "message": "Success"
}
```

### Mark All as Read
```
PUT /api/Notification/mark-all-read
```

**Response:**
```json
{
  "message": "Success"
}
```

## Implementation

### 1. SignalR Service (`notificationSignalRService.ts`)

The notification SignalR service manages the WebSocket connection:

```typescript
import { notificationSignalRService } from '@/services/notificationSignalRService';

// Subscribe to notifications
notificationSignalRService.onNotification((notification) => {
  console.log('New notification:', notification);
});

// Check connection status
const isConnected = notificationSignalRService.isConnected();
```

### 2. React Hooks (`useNotifications.ts`)

Two custom hooks are available:

#### `useNotifications()` - Full notification management

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,      // Array of notifications
    unreadCount,        // Number of unread notifications
    loading,            // Loading state
    isConnected,        // SignalR connection status
    loadNotifications,  // Reload notifications from API
    loadUnreadCount,    // Reload unread count
    markAsRead,         // Mark notification as read
    markAllAsRead,      // Mark all as read
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(n => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          {!n.isRead && (
            <button onClick={() => markAsRead(n.id)}>
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. UI Components (`NotificationComponents.tsx`)

Several pre-built components are available:

#### `NotificationBadge` - Unread count badge

```tsx
import { NotificationBadge } from '@/components/Common/NotificationComponents';

<div className="relative">
  <FaBell />
  <NotificationBadge count={unreadCount} />
</div>
```

#### `NotificationItem` - Single notification

```tsx
import { NotificationItem } from '@/components/Common/NotificationComponents';

<NotificationItem
  notification={notification}
  onMarkAsRead={(id) => markAsRead(id)}
/>
```

#### `NotificationList` - List of notifications

```tsx
import { NotificationList } from '@/components/Common/NotificationComponents';

<NotificationList
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  loading={loading}
/>
```

### 4. Automatic Integration

The notification system is automatically integrated at the app level:

**`layout.tsx`:**
```tsx
<AuthProvider>
  <NotificationProvider>  {/* Manages SignalR connection */}
    <ToastProvider>
      {/* App content */}
    </ToastProvider>
  </NotificationProvider>
</AuthProvider>
```

**Features:**
- ✅ Automatically connects when user logs in
- ✅ Automatically disconnects when user logs out
- ✅ Displays toast notifications for real-time events
- ✅ Handles reconnection automatically

## How It Works

### Real-Time Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Backend Event (e.g., Proposal Accepted)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend sends "ReceiveNotification" via SignalR            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend receives notification                             │
│  1. NotificationSignalRService receives event               │
│  2. Notifies all subscribers                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├─────────────────────┬───────────────┐
                        ▼                     ▼               ▼
              ┌─────────────────┐   ┌──────────────┐  ┌──────────┐
              │ Toast Displayed │   │ Update List  │  │ Update   │
              │ (ToastListener) │   │ (useNotif.)  │  │ Badge    │
              └─────────────────┘   └──────────────┘  └──────────┘
```

### Persistent Storage

- **Online users**: Receive notifications instantly via SignalR
- **Offline users**: Notifications are saved to database
- **On login**: Fetch all notifications from API
- **Result**: No notifications are lost!

## Usage Examples

### Example 1: Notification Bell in Header

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from '@/components/Common/NotificationComponents';
import { FaBell } from 'react-icons/fa';

function Header() {
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        <FaBell className="text-2xl" />
        <NotificationBadge count={unreadCount} />
      </button>
      
      {showDropdown && (
        <NotificationDropdown />
      )}
    </div>
  );
}
```

### Example 2: Notification Center Page

```tsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from '@/components/Common/NotificationComponents';

function NotificationCenter() {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <NotificationList
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        loading={loading}
      />
    </div>
  );
}
```

### Example 3: Custom Toast Handling

```tsx
import { useEffect } from 'react';
import { notificationSignalRService } from '@/services/notificationSignalRService';
import { useToast } from '@/context/ToastContext';

function CustomNotificationHandler() {
  const { success, error, info } = useToast();

  useEffect(() => {
    const unsubscribe = notificationSignalRService.onNotification((notification) => {
      // Custom logic based on notification type
      if (notification.type === 'ProposalAccepted') {
        success(`🎉 ${notification.title}\n${notification.message}`);
        // Navigate to proposal page
        router.push(`/proposals/${notification.relatedEntityId}`);
      } else if (notification.type === 'ProposalRejected') {
        error(`❌ ${notification.title}\n${notification.message}`);
      } else {
        info(`${notification.title}\n${notification.message}`);
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
```

## Connection Management

The `NotificationProvider` automatically manages the SignalR connection:

- **On user login**: Connects to notification hub
- **On user logout**: Disconnects from notification hub
- **On connection loss**: Automatically attempts to reconnect
- **On reconnect**: Syncs notifications from API

## Notification Object Structure

```typescript
interface Notification {
  id: number;                    // Unique notification ID
  title: string;                 // Notification title (with emoji)
  message: string;               // Notification message
  type: string;                  // Notification type (e.g., "ProposalAccepted")
  isRead: boolean;               // Read status
  createdAt: string;             // ISO timestamp
  relatedEntityId?: number;      // Related entity ID (e.g., proposal ID)
  relatedEntityType?: string;    // Related entity type (e.g., "Proposal")
}
```

## Best Practices

1. **Use the hook at component level** - `useNotifications()` provides all you need
2. **Use the provider at app level** - Already integrated in `layout.tsx`
3. **Don't manually manage connection** - Let `NotificationProvider` handle it
4. **Mark as read when appropriate** - Improves user experience
5. **Handle notification types** - Different types may need different actions

## Troubleshooting

### Notifications not appearing?

1. **Check SignalR connection**: Look for "✅ NotificationHub Connected!" in console
2. **Verify authentication**: User must be logged in
3. **Check token**: JWT token must be valid
4. **Test with API**: Try calling `notificationService.getNotifications()`

### Duplicate notifications?

- The system prevents duplicates by checking notification IDs
- If you see duplicates, check that you're not subscribing multiple times

### Connection keeps dropping?

- Check network stability
- Verify backend is running and accessible
- Check for CORS issues
- Review SignalR logs in console

## Testing

### Manual Testing

1. **Login to the app**
2. **Check console** for "✅ NotificationHub Connected!"
3. **Trigger an event** (e.g., submit a proposal)
4. **Verify toast appears** with notification
5. **Check notification list** to see it persisted

### Console Logging

Look for these messages:

- `✅ NotificationHub Connected!` - Connection successful
- `🔔 NotificationHub: New notification received:` - Real-time notification
- `✅ Loaded notifications from API:` - Initial load successful
- `✅ Marked notification as read:` - Mark as read successful

## Summary

✅ **Real-time delivery** via SignalR `ReceiveNotification` event  
✅ **Persistent storage** in database for offline users  
✅ **Automatic connection** management via `NotificationProvider`  
✅ **Toast notifications** for instant user feedback  
✅ **Custom hooks** for easy integration  
✅ **Pre-built components** for common UI patterns  
✅ **Type-safe** with TypeScript interfaces  
✅ **Automatic reconnection** on connection loss  

The notification system is now fully integrated and ready to use! 🎉
