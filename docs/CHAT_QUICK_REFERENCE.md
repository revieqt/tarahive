# Chat System - Quick Reference Guide

## 🚀 Quick Start

### 1. Import & Use
```typescript
import { useLocalSearchParams } from 'expo-router';
import chatSocket from '@/utils/socket';
import { getMessages } from '@/services/roomService';
```

### 2. In Component
```typescript
const { id: roomId } = useLocalSearchParams<{ id: string }>();
const userId = session?.user?.id;

useEffect(() => {
  // Get history + connect socket
  const init = async () => {
    const msgs = await getMessages(roomId);
    setMessages(msgs);
    
    await chatSocket.connect();
    await chatSocket.joinRoom(roomId);
    
    chatSocket.onReceiveMessage((msg) => {
      setMessages(prev => [...prev, msg]);
    });
  };
  
  init();
  
  return () => chatSocket.leaveRoom(roomId);
}, [roomId, userId]);
```

### 3. Send Message
```typescript
const handleSend = async (text) => {
  try {
    await chatSocket.sendMessage(roomId, text);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

## 📦 Files Overview

| File | Purpose | Type |
|------|---------|------|
| `app/rooms/[id]/index.tsx` | Chat screen component | **NEW** |
| `utils/socket.ts` | Socket singleton | **NEW** |
| `services/roomService.ts` | API methods | **UPDATED** |
| `package.json` | Dependencies | **UPDATED** |

## 🔌 Socket Methods

```typescript
// Connection
await chatSocket.connect()
chatSocket.disconnect()
chatSocket.isConnected()

// Room
await chatSocket.joinRoom(roomId)
chatSocket.leaveRoom(roomId)

// Messages
await chatSocket.sendMessage(roomId, text)
chatSocket.onReceiveMessage(callback)
chatSocket.offReceiveMessage()

// Typing
await chatSocket.sendTypingIndicator(roomId, true|false)
chatSocket.onUserTyping(callback)

// Read Receipts
await chatSocket.markMessagesSeen(roomId, [msgIds])
chatSocket.onMessagesSeen(callback)
```

## 📨 REST API

```typescript
// Fetch messages
const msgs = await getMessages(roomId, limit, cursor)

// Mark messages seen
await markMessagesSeen(roomId, messageIds)
```

## 🎯 Event Flow

```
User types message
  → handleSend() called
    → emit "send_message" via socket
      → Backend saves to MongoDB
        → broadcast "receive_message" to room
          → onReceiveMessage() callback triggers
            → UI updates with new message
```

## 💡 Common Patterns

### Typing Indicator
```typescript
const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

const handleText = (text) => {
  setText(text);
  
  if (typingTimeout) clearTimeout(typingTimeout);
  
  chatSocket.sendTypingIndicator(roomId, true);
  
  setTypingTimeout(
    setTimeout(() => {
      chatSocket.sendTypingIndicator(roomId, false);
    }, 2000)
  );
};
```

### Auto-Scroll
```typescript
useEffect(() => {
  setTimeout(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, 100);
}, [messages]);
```

### Error Handling
```typescript
try {
  await chatSocket.connect();
} catch (error) {
  if (error.message.includes('Auth')) {
    // Redirect to login
  } else {
    // Show retry UI
  }
}
```

## 🐛 Debugging

```typescript
// Check connection
console.log(chatSocket.isConnected());

// Get socket instance
const socket = chatSocket.getSocket();

// Add error listener
chatSocket.onError((err) => {
  console.error('Socket error:', err);
});

// Listen to disconnect
chatSocket.onDisconnect(() => {
  console.log('Disconnected - attempting reconnect...');
});
```

## ✅ Checklist for Integration

- [ ] Install `socket.io-client`
- [ ] Verify `BACKEND_URL` in `Config.ts`
- [ ] Test `getAccessToken()` returns valid JWT
- [ ] Backend Socket.IO running on same URL as REST API
- [ ] User is member of room (status = 'member')
- [ ] Navigate to `/rooms/[roomId]` to open chat

## 🚨 Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| Messages not appearing | Check socket connection, verify room join |
| Typing indicators lag | Increase debounce timeout value |
| Duplicate messages | Already handled - message._id deduplication |
| Auto-scroll jerky | Use `animated: true` parameter |

## 📱 Component Structure

```
ChatScreen (index.tsx)
├── ChatHeader (room name, member count)
├── ChatArea
│   └── FlatList
│       └── ChatBubble (for each message)
├── ChatField (input + send button)
└── TypingIndicator (active users)
```

## 🔐 Security

- ✅ JWT authentication on socket connect
- ✅ Backend validates room membership
- ✅ Server validates message content
- Frontend: Never expose tokens, sanitize user input

## 📊 Performance Tips

- Use `windowSize={10}` in FlatList for memory efficiency
- Paginate history with `cursor` parameter
- Debounce typing indicators (2 second timeout)
- Remove listeners on unmount

## 🎓 Learning Resources

- Socket.IO Client Docs: https://socket.io/docs/v4/client-api/
- React Native FlatList: https://reactnative.dev/docs/flatlist
- Expo Router: https://expo.dev/docs/routing/introduction

---

**Need help?** Check `CHAT_SYSTEM_IMPLEMENTATION.md` for detailed docs.
