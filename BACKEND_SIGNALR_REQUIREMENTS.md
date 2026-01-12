# Backend SignalR Requirements for Chat Features

## Overview
The frontend requires the following SignalR events and methods to support:
1. **Connection Status** - Already working ✅
2. **Typing Indicators** - Like Instagram (shows "يكتب..." when user is typing)
3. **Read Receipts** - Two checkmarks (✓ = sent, ✓✓ = read/seen)

---

## Required SignalR Hub Methods

### 1. SendTypingIndicator
**Method Name**: `SendTypingIndicator`  
**Parameters**:
- `conversationId` (int) - The conversation ID
- `isTyping` (bool) - True when user starts typing, false when they stop

**Description**:  
Client calls this method to notify other participants that they are typing.

**Example Call**:
```csharp
await Clients.OthersInGroup($"Conversation_{conversationId}")
    .SendAsync("UserTyping", new TypingIndicator
    {
        ConversationId = conversationId,
        UserId = Context.UserIdentifier,
        UserName = user.Name,
        IsTyping = isTyping
    });
```

---

## Required SignalR Hub Events (Client Receives)

### 1. UserTyping
**Event Name**: `UserTyping`  
**Payload**:
```json
{
  "conversationId": 1,
  "userId": "user-guid",
  "userName": "Ahmed Mohamed",
  "isTyping": true
}
```

**Description**:  
Sent to all other participants in the conversation when someone starts/stops typing.

**When to Send**:
- When `SendTypingIndicator` is called with `isTyping = true`
- Automatically send `isTyping = false` after 2-3 seconds of inactivity (or when user sends a message)

---

### 2. MessageRead
**Event Name**: `MessageRead`  
**Payload**:
```json
{
  "messageId": 123,
  "conversationId": 1,
  "readAt": "2024-12-09T10:30:00Z"
}
```

**Description**:  
Sent when a message is marked as read (when user opens/sees the conversation).

**When to Send**:
- When the frontend calls `POST /api/Chat/conversations/{id}/mark-read`
- Send this event to the message sender so they see the ✓✓ (read) status

---

## Message Model Updates

### ChatMessage Response
The `ChatMessage` model returned from API should include:
```csharp
public class ChatMessage
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public string SenderId { get; set; }
    public string SenderName { get; set; }
    public string? SenderAvatar { get; set; }
    public string Content { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; } // ✅ Already exists - ensure it's updated correctly
}
```

**Important**: The `IsRead` field should be:
- `false` when message is sent
- `true` when the recipient has opened/seen the conversation (after calling mark-read endpoint)

---

## SignalR Message Event Updates

### ReceiveMessage Event
The existing `ReceiveMessage` event should optionally include `isRead`:
```json
{
  "messageId": 123,
  "conversationId": 1,
  "senderId": "user-guid",
  "senderName": "Ahmed Mohamed",
  "content": "Hello!",
  "fileUrl": null,
  "fileName": null,
  "sentAt": "2024-12-09T10:30:00Z",
  "isRead": false  // Optional - can be omitted if not available
}
```

---

## Implementation Notes

### Typing Indicator Behavior
1. **Start Typing**: When user types, frontend calls `SendTypingIndicator(conversationId, true)`
2. **Stop Typing**: Frontend automatically calls `SendTypingIndicator(conversationId, false)` after 2 seconds of no typing
3. **Auto-Stop**: Backend should also auto-stop typing indicator after 3-5 seconds if no new typing event arrives
4. **On Message Send**: When user sends a message, typing indicator should stop automatically

### Read Receipt Behavior
1. **Message Sent**: `isRead = false` (shows ✓)
2. **Message Delivered**: When message arrives via SignalR, it's considered "delivered" (still shows ✓)
3. **Message Read**: When recipient opens conversation and calls `mark-read`, send `MessageRead` event to sender (shows ✓✓)

### Groups/Connection Management
- Use SignalR groups: `Conversation_{conversationId}` to send events only to participants in that conversation
- Ensure users are added to groups when they open a conversation
- Remove users from groups when they leave/close the conversation

---

## Testing Checklist

- [ ] Typing indicator appears when user types
- [ ] Typing indicator disappears after 2-3 seconds of no typing
- [ ] Typing indicator disappears when message is sent
- [ ] Read receipt shows ✓ when message is sent
- [ ] Read receipt shows ✓✓ when message is read by recipient
- [ ] Connection status shows correctly (Connected/Disconnected)
- [ ] Events are only sent to participants in the conversation

---

## Example Backend Implementation (C#)

```csharp
public class ChatHub : Hub
{
    // Send typing indicator
    public async Task SendTypingIndicator(int conversationId, bool isTyping)
    {
        var userId = Context.UserIdentifier;
        var userName = await GetUserNameAsync(userId);
        
        await Clients.OthersInGroup($"Conversation_{conversationId}")
            .SendAsync("UserTyping", new
            {
                ConversationId = conversationId,
                UserId = userId,
                UserName = userName,
                IsTyping = isTyping
            });
    }

    // Join conversation group
    public async Task JoinConversation(int conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation_{conversationId}");
    }

    // Leave conversation group
    public async Task LeaveConversation(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Conversation_{conversationId}");
    }
}

// In your ChatController when marking as read:
[HttpPost("conversations/{id}/mark-read")]
public async Task<IActionResult> MarkAsRead(int id)
{
    // ... mark messages as read logic ...
    
    // Send read receipt event to message senders
    var unreadMessages = await GetUnreadMessagesForConversation(id, currentUserId);
    foreach (var message in unreadMessages)
    {
        await _hubContext.Clients.User(message.SenderId)
            .SendAsync("MessageRead", new
            {
                MessageId = message.Id,
                ConversationId = id,
                ReadAt = DateTime.UtcNow
            });
    }
    
    return Ok(new { message = "Messages marked as read" });
}
```

---

## Questions?

If you need any clarification or have questions about the implementation, please let me know!

