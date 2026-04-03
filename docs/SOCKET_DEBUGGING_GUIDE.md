# Socket.IO Debugging Checklist

## 🔍 Quick Diagnosis

The socket initialization should now have **verbose logging**. Check your console for these patterns:

### ✅ Expected Success Flow
```
🟡 Fetching access token...
✅ Token fetched
🟡 Connecting to: http://192.168.68.103:5000
🟡 Socket connection in progress...
✅ Socket connected, ID: xxxxxxxx
🟡 Attempting to join room: [room-id]
✅ Joined room: [room-id]
🟡 Sending message to room [room-id]
✅ Message sent
```

### 🔴 Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| `No session found. User must be logged in.` | `getAccessToken` failed | Ensure user is logged in before entering chat |
| `Socket connection timeout` | Backend not running or unreachable | Check if backend is running: `npm run dev` in backend folder |
| `Failed to join room: Access denied` | User not a member of room | Check room membership in database |
| `Failed to send message: timeout` | Socket not properly connected | Verify socket connection before sending |

## 🔧 Manual Testing Steps

### 1. **Test Token Availability**
```typescript
import { getAccessToken } from '@/utils/getAccessToken';

const token = await getAccessToken();
console.log('Token:', token);
```

### 2. **Test Socket Connection**
```typescript
import chatSocket from '@/utils/socket';

try {
  const socket = await chatSocket.connect();
  console.log('Connected:', socket.connected, 'ID:', socket.id);
} catch (error) {
  console.error('Connection failed:', error);
}
```

### 3. **Test Join Room**
```typescript
try {
  await chatSocket.joinRoom('your-room-id');
  console.log('Room joined successfully');
} catch (error) {
  console.error('Join failed:', error);
}
```

### 4. **Test Send Message**
```typescript
try {
  const msgId = await chatSocket.sendMessage('your-room-id', 'test message');
  console.log('Message sent:', msgId);
} catch (error) {
  console.error('Send failed:', error);
}
```

## ⚙️ Configuration Checks

### Backend URL
```typescript
// In app/constants/Config.ts
export const BACKEND_URL = 'http://192.168.68.103:5000';
```

**Verify**:
- ✅ Backend is running on this address
- ✅ Port 5000 is correct
- ✅ No firewall blocking the connection

### Socket.IO Server Setup
```typescript
// Backend should have Socket.IO configured
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
```

### Environment Variables
Make sure your backend has:
- `JWT_SECRET` - For token verification
- `PORT` - Set to 5000
- MongoDB connection string

## 🧪 Use Socket Debug Utility

Add to your chat screen temporarily:

```typescript
import { testSocketConnection } from '@/utils/socketDebug';

export default function RoomChatScreen() {
  useEffect(() => {
    // Run test on mount
    testSocketConnection();
  }, []);

  // ... rest of component
}
```

Check console output for detailed connection info.

## 🔗 Network Debugging

### Check if Backend is Reachable
```typescript
// In component
useEffect(() => {
  fetch('http://192.168.68.103:5000/api/health')
    .then(r => r.json())
    .then(data => console.log('Backend healthy:', data))
    .catch(err => console.error('Backend unreachable:', err));
}, []);
```

### Check Socket Events
```typescript
const socket = await chatSocket.getSocket();

socket.on('receive_message', (msg) => {
  console.log('📨 Message received:', msg);
});

socket.on('connect', () => {
  console.log('🟢 Connected');
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected');
});

socket.on('error', (error) => {
  console.log('⚠️ Error:', error);
});
```

## 📋 Pre-Flight Checklist

Before testing chat:

- [ ] Backend is running: `cd backend && npm run dev`
- [ ] Backend server logs show "Socket.IO listening"
- [ ] User is logged in (has valid JWT token)
- [ ] Room ID is valid and user is a room member
- [ ] Network connection is stable (no firewall blocking)
- [ ] `BACKEND_URL` in Config.ts matches actual backend
- [ ] `socket.io-client` is installed: `npm list socket.io-client`

## 🚨 If Chat Still Doesn't Work

1. **Check backend logs** for authentication errors
2. **Look at network tab** in React Native debugger for Socket.IO upgrade/polling
3. **Verify token** is being sent with socket handshake
4. **Test API endpoints** separately to ensure backend is working
5. **Check firewall/proxy** settings that might block WebSocket

## 🎯 Quick Fix Attempts

### If Token Fails
```typescript
// Ensure session is stored correctly
const session = await AsyncStorage.getItem('session');
console.log('Session in storage:', session);
```

### If Socket Won't Connect
```typescript
// Try polling-only mode (slower but more compatible)
// In socket.ts, change:
transports: ['polling'], // Remove 'websocket' temporarily
```

### If Join Room Fails
```typescript
// Verify room membership via API first
const room = await getSpecificRoom(roomId);
console.log('Room members:', room.members);
console.log('Current user in room?', room.members.some(m => m.userID === userId));
```

---

**Having issues?** Check the console output for emoji patterns: 🟡 = in progress, ✅ = success, 🔴 = error
