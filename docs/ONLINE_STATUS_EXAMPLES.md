# Online Status Components - Usage Examples

## Quick Start

### 1. Using the Hook in Any Component

```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const { isUserOnline } = useOnlineStatus();
  
  return (
    <div>
      {isUserOnline(userId) ? (
        <span className="text-green-500">🟢 Online</span>
      ) : (
        <span className="text-gray-400">🔴 Offline</span>
      )}
    </div>
  );
}
```

### 2. Using the Badge Component

```tsx
import { OnlineStatusBadge } from '@/components/Common/OnlineStatusBadge';

function UserCard({ user }) {
  return (
    <div className="flex items-center gap-3">
      <img src={user.avatar} className="w-12 h-12 rounded-full" />
      <div>
        <h3>{user.name}</h3>
        <OnlineStatusBadge userId={user.id} size="sm" />
      </div>
    </div>
  );
}
```

### 3. Using the Dot Indicator on Avatar

```tsx
import { OnlineStatusDot } from '@/components/Common/OnlineStatusBadge';

function UserAvatar({ user }) {
  return (
    <div className="relative inline-block">
      <img 
        src={user.avatar} 
        className="w-12 h-12 rounded-full object-cover" 
      />
      <OnlineStatusDot 
        userId={user.id} 
        position="bottom-right" 
        size="md" 
      />
    </div>
  );
}
```

## Advanced Examples

### Example 1: User List with Online Status

```tsx
import { OnlineStatusBadge } from '@/components/Common/OnlineStatusBadge';

function UserList({ users }) {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user.id} className="flex items-center justify-between p-4 border rounded">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full" />
            <div>
              <h4 className="font-semibold">{user.name}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <OnlineStatusBadge userId={user.id} size="sm" />
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Chat Conversation List

```tsx
import { OnlineStatusDot } from '@/components/Common/OnlineStatusBadge';

function ConversationList({ conversations }) {
  return (
    <div>
      {conversations.map(conv => (
        <button 
          key={conv.id} 
          className="w-full p-4 flex items-center gap-3 hover:bg-gray-50"
        >
          <div className="relative">
            <img 
              src={conv.participantAvatar} 
              className="w-12 h-12 rounded-full" 
            />
            <OnlineStatusDot 
              userId={conv.participantId} 
              position="bottom-right" 
            />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold">{conv.participantName}</h3>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
```

### Example 3: Profile Header with Status

```tsx
import { OnlineStatusBadge, OnlineStatusDot } from '@/components/Common/OnlineStatusBadge';

function ProfileHeader({ user }) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <img 
          src={user.avatar} 
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" 
        />
        <OnlineStatusDot 
          userId={user.id} 
          position="bottom-right" 
          size="lg" 
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <p className="text-gray-600">{user.title}</p>
        <OnlineStatusBadge userId={user.id} size="md" className="mt-2" />
      </div>
    </div>
  );
}
```

### Example 4: Using the Hook for Custom Logic

```tsx
import { useUserOnlineStatus } from '@/hooks/useOnlineStatus';

function CustomStatusComponent({ userId }) {
  const { isOnline, loading } = useUserOnlineStatus(userId);

  if (loading) {
    return <div className="animate-pulse">Loading status...</div>;
  }

  return (
    <div className={`p-4 rounded-lg ${isOnline ? 'bg-green-50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="font-medium">
          {isOnline ? 'Available for chat' : 'Currently offline'}
        </span>
      </div>
      {isOnline && (
        <p className="text-sm text-gray-600 mt-2">
          This user is online and can respond to messages
        </p>
      )}
    </div>
  );
}
```

### Example 5: Tracking Multiple Users

```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function TeamDashboard({ team }) {
  const { onlineUsers, isUserOnline } = useOnlineStatus();

  const onlineCount = team.filter(member => isUserOnline(member.id)).length;
  const totalCount = team.length;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Team Status</h2>
        <p className="text-gray-600">
          {onlineCount} of {totalCount} members online
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {team.map(member => (
          <div 
            key={member.id} 
            className={`p-4 rounded-lg border-2 ${
              isUserOnline(member.id) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={member.avatar} 
                  className="w-10 h-10 rounded-full" 
                />
                <OnlineStatusDot userId={member.id} />
              </div>
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 6: Refreshing Status Manually

```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function UserStatusWithRefresh({ userId }) {
  const { isUserOnline, refreshUserStatus, loading } = useOnlineStatus();

  const handleRefresh = async () => {
    const isOnline = await refreshUserStatus(userId);
    console.log('Refreshed status:', isOnline);
  };

  return (
    <div className="flex items-center gap-3">
      <OnlineStatusBadge userId={userId} />
      <button 
        onClick={handleRefresh}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Status
      </button>
    </div>
  );
}
```

## Component Props Reference

### OnlineStatusBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string \| undefined` | - | User ID to track (required) |
| `showText` | `boolean` | `true` | Show "Online"/"Offline" text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the badge |
| `className` | `string` | `''` | Additional CSS classes |

### OnlineStatusDot

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string \| undefined` | - | User ID to track (required) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the dot |
| `position` | `'top-right' \| 'bottom-right' \| 'top-left' \| 'bottom-left'` | `'bottom-right'` | Position relative to parent |
| `className` | `string` | `''` | Additional CSS classes |

## Hook Return Values

### useOnlineStatus()

```typescript
{
  onlineUsers: string[];              // Array of online user IDs
  onlineUsersSet: Set<string>;        // Set of online user IDs
  isUserOnline: (userId) => boolean;  // Check if user is online
  refreshUserStatus: (userId) => Promise<boolean>;  // Refresh specific user
  refreshAllOnlineUsers: () => Promise<void>;       // Refresh all users
  loading: boolean;                   // Initial loading state
}
```

### useUserOnlineStatus(userId)

```typescript
{
  isOnline: boolean;  // Whether the user is online
  loading: boolean;   // Loading state
}
```

## Tips

1. **Use `OnlineStatusDot` for avatars** - It's designed to overlay on circular avatars
2. **Use `OnlineStatusBadge` for lists** - Shows clear text status
3. **Use hooks for custom logic** - When you need more control
4. **Case-insensitive matching** - User IDs are compared case-insensitively
5. **Real-time updates** - All components update automatically via SignalR

## Styling

All components support:
- ✅ Light/Dark mode (uses theme colors)
- ✅ RTL/LTR layouts (Arabic/English)
- ✅ Custom CSS classes via `className` prop
- ✅ Responsive sizing with `size` prop

## Performance

- ✅ **Efficient updates** - Only re-renders when status changes
- ✅ **Shared state** - All components share the same online users state
- ✅ **Automatic cleanup** - Unsubscribes from events on unmount
- ✅ **Debounced API calls** - Prevents excessive requests

---

Happy coding! 🎉
