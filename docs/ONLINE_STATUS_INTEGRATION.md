# Online/Offline Status Integration - Frontend Implementation

## Overview
This document describes the frontend implementation of the real-time online/offline status feature using SignalR and REST API fallback.

## Backend Events

The backend sends the following SignalR events:

- **`UserOnline`**: Fired when a user connects to the chat hub
- **`UserOffline`**: Fired when a user disconnects from the chat hub

## API Endpoints

### Check Specific User Status
```
GET /api/chat/user/{userId}/online-status
```

**Response:**
```json
{
  "userId": "user-123",
  "isOnline": true,
  "timestamp": "2026-01-13T10:30:00Z"
}
```

### Get All Online Users
```
GET /api/chat/online-users
```

**Response:**
```json
{
  "onlineUsers": ["user-1", "user-2", "user-3"],
  "count": 3,
  "timestamp": "2026-01-13T10:30:00Z"
}
```

## Implementation

### 1. SignalR Service (`signalRService.ts`)

The SignalR service listens for `UserOnline` and `UserOffline` events:

```typescript
// Subscribe to user status changes
signalRService.onUserStatusChange((status) => {
  console.log('User status:', status.userId, status.isOnline);
});

// Check user status via SignalR hub method
const isOnline = await signalRService.checkUserOnlineStatus(userId);
```

### 2. API Service (`api.ts`)

The chat service provides REST API methods:

```typescript
// Check if a specific user is online
const response = await chatService.checkUserOnlineStatus(userId);
console.log('Is online:', response.data.isOnline);

// Get all online users
const response = await chatService.getOnlineUsers();
console.log('Online users:', response.data.onlineUsers);
```

### 3. React Hooks (`useOnlineStatus.ts`)

Two custom hooks are available:

#### `useOnlineStatus()` - Track all online users

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const { 
    onlineUsers,           // Array of online user IDs
    isUserOnline,          // Function to check if user is online
    refreshUserStatus,     // Refresh specific user status
    refreshAllOnlineUsers, // Refresh all online users
    loading 
  } = useOnlineStatus();

  // Check if a user is online
  const isOnline = isUserOnline(userId);

  // Manually refresh a user's status
  const handleRefresh = async () => {
    const isOnline = await refreshUserStatus(userId);
  };

  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}
```

#### `useUserOnlineStatus(userId)` - Track specific user

```typescript
import { useUserOnlineStatus } from '@/hooks/useOnlineStatus';

function UserStatusBadge({ userId }: { userId: string }) {
  const { isOnline, loading } = useUserOnlineStatus(userId);

  if (loading) return <span>Loading...</span>;

  return (
    <div>
      {isOnline ? (
        <span className="text-green-500">🟢 Online</span>
      ) : (
        <span className="text-gray-400">🔴 Offline</span>
      )}
    </div>
  );
}
```

### 4. Messages Component Implementation

The Messages component already implements online/offline status:

```typescript
// 1. Loads initial online users from API on mount
useEffect(() => {
  const loadInitialOnlineUsers = async () => {
    const response = await chatService.getOnlineUsers();
    setOnlineUsers(new Set(response.data.onlineUsers));
  };
  loadInitialOnlineUsers();
}, []);

// 2. Subscribes to real-time updates
useEffect(() => {
  const unsubscribe = signalRService.onUserStatusChange((status) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status.isOnline) {
        newSet.add(status.userId);
      } else {
        newSet.delete(status.userId);
      }
      return newSet;
    });
  });
  return unsubscribe;
}, []);

// 3. Displays status in chat header
{isTyping && (
  <span className="text-primary-500">Typing...</span>
)}

{!isTyping && isUserOnline(participantId) && (
  <span className="text-green-500">🟢 Online</span>
)}

{!isTyping && !isUserOnline(participantId) && (
  <span className="text-gray-400">🔴 Offline</span>
)}
```

## Status Priority

The component displays status in this priority order:

1. **Typing** (highest priority) - Shows when user is actively typing
2. **Online** - Shows when user is connected but not typing
3. **Offline** - Shows when user is disconnected

## How It Works

### Connection Flow

1. **User opens app** → SignalR connects → Backend broadcasts `UserOnline` event
2. **User closes app** → SignalR disconnects → Backend broadcasts `UserOffline` event
3. **Real-time updates** → All connected clients receive status changes instantly

### Data Flow

```
┌─────────────────┐
│  User A Opens   │
│   Chat App      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SignalR Connect │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     UserOnline Event      ┌─────────────────┐
│   Backend Hub   │ ───────────────────────▶  │   User B's      │
│                 │                            │   Frontend      │
└─────────────────┘                            └─────────────────┘
         │                                              │
         │                                              ▼
         │                                     ┌─────────────────┐
         │                                     │ Update UI:      │
         │                                     │ User A = Online │
         │                                     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  User A Closes  │
│   Chat App      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│SignalR Disconnect│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     UserOffline Event     ┌─────────────────┐
│   Backend Hub   │ ───────────────────────▶  │   User B's      │
│                 │                            │   Frontend      │
└─────────────────┘                            └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Update UI:      │
                                               │ User A = Offline│
                                               └─────────────────┘
```

## Troubleshooting

### Status not updating?

1. **Check SignalR connection**: Look for "✅ SignalR Connected!" in console
2. **Verify event names**: Backend must send `UserOnline`/`UserOffline` (not `UserConnected`/`UserDisconnected`)
3. **Check user ID format**: Ensure user IDs are consistent (string vs GUID)
4. **Test with API**: Try calling `chatService.getOnlineUsers()` to verify backend is tracking status

### User appears offline but is online?

1. **Check initial load**: Verify `getOnlineUsers()` is called on mount
2. **Check case sensitivity**: User ID comparison is case-insensitive
3. **Refresh status**: Call `refreshUserStatus(userId)` to force an update

### Events not firing?

1. **Verify hub connection**: User must be connected to `/chatHub`
2. **Check authentication**: JWT token must be valid
3. **Test with two browsers**: Open app in two windows to see real-time updates

## Testing

### Manual Testing

1. **Open app in Browser 1** → User A connects
2. **Open app in Browser 2** → User B connects
3. **In Browser 2**: Check if User A shows as "Online"
4. **Close Browser 1** → User A disconnects
5. **In Browser 2**: Check if User A shows as "Offline"

### Console Logging

Look for these console messages:

- `✅ Loaded initial online users from API: X` - Initial load successful
- `👤 User Status Update: { userId: "...", isOnline: true }` - Real-time update received
- `🟢 SignalR: User Online (Raw): ...` - SignalR event received
- `🔴 SignalR: User Offline (Raw): ...` - SignalR event received

## Best Practices

1. **Always load initial state from API** - Don't rely solely on real-time events
2. **Use case-insensitive comparison** - User IDs may have different casing
3. **Handle connection failures gracefully** - Show "Unknown" status if API fails
4. **Prioritize typing over online status** - Typing is more important to show
5. **Debounce status checks** - Don't spam the API with status requests

## Summary

✅ **Real-time updates** via SignalR events (`UserOnline`/`UserOffline`)  
✅ **API fallback** for initial load and manual refresh  
✅ **Custom hooks** for easy integration  
✅ **Case-insensitive** user ID comparison  
✅ **Status priority**: Typing → Online → Offline  
✅ **Automatic reconnection** with SignalR  

The online/offline status feature is now fully integrated and ready to use! 🎉
