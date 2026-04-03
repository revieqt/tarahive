# Real-Time Chat Backend Documentation

## Overview

A scalable, production-ready real-time chat system using Socket.IO and MongoDB for room-based conversations. Only users with `member` status in a room can access its chat.

---

## Architecture

### Files Created

```
backend/src/
├── modules/room/
│   ├── message.controller.ts    # REST API handlers for messages
│   ├── message.routes.ts        # REST API routes for messages
│   └── message.model.ts         # Message schema (already existed)
├── sockets/
│   └── chatSocket.ts            # Socket.IO event handlers
└── index.ts                      # Updated with Socket.IO integration
```

---

## REST API Endpoints

### 1. Get Messages (Cursor Pagination)
**Endpoint:** `GET /api/messages/:roomId`

**Query Parameters:**
- `limit` (optional): Number of messages (default: 20, max: 100)
- `cursor` (optional): Timestamp for pagination

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "roomId": "room_id",
        "senderId": "user_id",
        "message": "Hello!",
        "createdAt": "2024-03-19T10:30:00Z",
        "seenBy": ["user_id_1", "user_id_2"]
      }
    ],
    "pagination": {
      "nextCursor": "2024-03-19T10:29:00Z",
      "hasMore": true
    }
  }
}
```

**Security:** Only room members (status = "member") can fetch messages.

---

### 2. Create Message (Fallback)
**Endpoint:** `POST /api/messages`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "roomId": "room_id",
  "senderId": "user_id",
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "message": "Message created successfully",
  "data": {
    "_id": "message_id",
    "roomId": "room_id",
    "senderId": "user_id",
    "message": "Hello everyone!",
    "createdAt": "2024-03-19T10:30:00Z",
    "seenBy": ["user_id"]
  }
}
```

**Security:** 
- Only room members can send messages
- `senderId` must match the JWT token's userId

---

### 3. Mark Messages as Seen
**Endpoint:** `POST /api/messages/mark-seen`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "roomId": "room_id",
  "messageIds": ["msg_id_1", "msg_id_2"]
}
```

**Response:**
```json
{
  "message": "Messages marked as seen",
  "data": {
    "modifiedCount": 2
  }
}
```

---

## Socket.IO Events

### Client → Server Events

#### 1. `join_room`
Join a room's chat and receive real-time updates.

**Emit:**
```javascript
socket.emit('join_room', { roomId: 'room_123' }, (success, message) => {
  console.log(success ? 'Joined!' : 'Failed: ' + message);
});
```

**Security:** Validates user is a member with status "member"

---

#### 2. `send_message`
Send a message to the room (saves to MongoDB automatically).

**Emit:**
```javascript
socket.emit('send_message', 
  { 
    roomId: 'room_123',
    message: 'Hello everyone!'
  }, 
  (success, data) => {
    if (success) {
      console.log('Message sent:', data.messageId);
    } else {
      console.log('Failed:', data);
    }
  }
);
```

**Server Actions:**
- Validates membership
- Saves message to MongoDB with `seenBy: [senderId]`
- Updates room's `lastMessage` and `lastMessageAt`
- Broadcasts to all users in the room

---

#### 3. `typing`
Broadcast typing indicator to other users.

**Emit:**
```javascript
// User starts typing
socket.emit('typing', 
  { 
    roomId: 'room_123',
    isTyping: true
  },
  (success) => {}
);

// User stops typing
socket.emit('typing', 
  { 
    roomId: 'room_123',
    isTyping: false
  },
  (success) => {}
);
```

---

#### 4. `mark_seen`
Mark multiple messages as seen by the current user.

**Emit:**
```javascript
socket.emit('mark_seen',
  {
    roomId: 'room_123',
    messageIds: ['msg_1', 'msg_2', 'msg_3']
  },
  (success, data) => {
    console.log(`Marked ${data.markedCount} messages as seen`);
  }
);
```

---

#### 5. `leave_room`
Leave a room's chat namespace.

**Emit:**
```javascript
socket.emit('leave_room',
  { roomId: 'room_123' },
  (success, message) => {
    console.log(success ? 'Left room' : 'Error: ' + message);
  }
);
```

---

### Server → Client Events (Listen)

#### 1. `receive_message`
Receive new message from any user in the room.

**Listen:**
```javascript
socket.on('receive_message', (data) => {
  console.log(`${data.senderId}: ${data.message}`);
  // data = {
  //   _id: 'msg_id',
  //   roomId: 'room_123',
  //   senderId: 'user_id',
  //   message: 'Hello!',
  //   createdAt: '2024-03-19T10:30:00Z',
  //   seenBy: ['user_id']
  // }
});
```

---

#### 2. `user_typing`
Typing indicator from other users.

**Listen:**
```javascript
socket.on('user_typing', (data) => {
  // data = {
  //   userId: 'user_id',
  //   isTyping: true,
  //   timestamp: '2024-03-19T10:30:00Z'
  // }
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`);
  }
});
```

---

#### 3. `messages_seen`
Notification when other users see messages.

**Listen:**
```javascript
socket.on('messages_seen', (data) => {
  // data = {
  //   userId: 'user_id',
  //   messageIds: ['msg_1', 'msg_2'],
  //   timestamp: '2024-03-19T10:30:00Z'
  // }
  console.log(`${data.userId} saw your messages`);
});
```

---

#### 4. `user_joined`
Notification when a user joins the room chat.

**Listen:**
```javascript
socket.on('user_joined', (data) => {
  console.log(`${data.userId} joined the chat`);
});
```

---

#### 5. `user_left`
Notification when a user leaves the room.

**Listen:**
```javascript
socket.on('user_left', (data) => {
  console.log(`${data.userId} left the chat`);
});
```

---

## Frontend Implementation Example

```typescript
import { io, Socket } from 'socket.io-client';

// Initialize Socket.IO connection
const socket: Socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
  },
});

// Join a room
socket.emit('join_room', { roomId: 'room_123' }, (success, message) => {
  if (success) {
    console.log('✅ Joined room');
  } else {
    console.log('❌', message);
  }
});

// Listen for new messages
socket.on('receive_message', (message) => {
  console.log(`${message.senderId}: ${message.message}`);
  updateUIWithMessage(message);
});

// Send a message
function sendMessage(text: string) {
  socket.emit(
    'send_message',
    { roomId: 'room_123', message: text },
    (success, data) => {
      if (success) {
        console.log('Message sent');
      }
    }
  );
}

// Typing indicator
let isTypingTimeout: NodeJS.Timeout;

function onTextChange() {
  socket.emit('typing', { roomId: 'room_123', isTyping: true });
  
  clearTimeout(isTypingTimeout);
  isTypingTimeout = setTimeout(() => {
    socket.emit('typing', { roomId: 'room_123', isTyping: false });
  }, 1000);
}

// Mark messages as seen
function markMessagesSeen(messageIds: string[]) {
  socket.emit('mark_seen', {
    roomId: 'room_123',
    messageIds,
  });
}

// Cleanup on unmount
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## Security Features

### ✅ Implemented

1. **JWT Authentication**: All Socket.IO connections require valid JWT token
2. **Membership Verification**: Only users with `status: "member"` in room.members can:
   - Join room chat
   - Send messages
   - View messages
   - Mark messages as seen

3. **User Isolation**: Token userId must match senderId (cannot send messages as another user)

4. **Error Handling**: Proper error messages and logging for debugging

### 🔒 Access Control Flow

```
Socket Connection Request
  ↓
Verify JWT Token
  ↓
Extract userId from token
  ↓
User joins/sends message to room
  ↓
Query MongoDB: Room.members[].userID === userId && status === "member"
  ↓
✅ Allowed OR ❌ Access Denied
```

---

## Message Model

```typescript
interface IMessage {
  _id: ObjectId;
  roomId: string;          // Reference to room
  senderId: string;        // User ID who sent the message
  message: string;         // Message content
  createdAt: Date;         // Timestamp
  seenBy: string[];        // Array of user IDs who saw the message
}
```

---

## Room Model Updates

The `Room` model was enhanced with:

```typescript
{
  lastMessage?: string;      // Preview of last message (first 100 chars)
  lastMessageAt?: Date;      // Timestamp of last message
}
```

These are automatically updated when new messages are sent.

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No token provided" | Missing auth header | Include `Authorization: Bearer <token>` |
| "Invalid token" | Expired or malformed JWT | Re-authenticate user |
| "User is not a member of this room" | Attempting to access non-joined room | Only members can join/send messages |
| "Room not found" | Invalid roomId | Verify roomId is correct |
| "Invalid or expired token" | Token expired | Refresh token and reconnect |

---

## Performance Considerations

1. **Cursor-Based Pagination**: Efficient for loading past messages
   - Avoids offset-based pagination problems
   - Handles real-time insertions correctly
   - Limit: 20-100 messages per request

2. **Message Indexing**: Recommended MongoDB indexes:
   ```typescript
   // Create these indexes on MessageModel
   db.messages.createIndex({ roomId: 1, createdAt: -1 });
   db.messages.createIndex({ senderId: 1 });
   ```

3. **Socket.IO Configuration**:
   - Supports WebSocket and polling transports
   - CORS enabled for frontend connections
   - Connection pooling via MongoDB driver

---

## Deployment Checklist

- [ ] Set `FRONTEND_URL` environment variable in `.env`
- [ ] Create MongoDB indexes on messages collection
- [ ] Configure JWT_SECRET in `.env`
- [ ] Enable WebSocket support on hosting platform (required for Socket.IO)
- [ ] Test Socket.IO connection from frontend
- [ ] Monitor Socket.IO connections in production
- [ ] Set up message retention policy (optional)

---

## Environment Variables

```env
JWT_SECRET=your_secret_key
FRONTEND_URL=https://yourdomain.com
PORT=5000
```

---

## Testing Socket.IO

### Using Socket.IO Testing Tools

**WebSocket Client Test:**
```bash
# Install socket.io-client globally
npm install -g socket.io-client

# Connect and test
socketio-client http://localhost:5000 \
  --auth "token=YOUR_JWT_TOKEN" \
  --emit "join_room" --data '{"roomId":"room_123"}'
```

---

## Future Enhancements

1. **Message Threading/Replies**: Add replyTo field
2. **File Uploads**: Extend message schema for attachments
3. **Message Reactions/Emojis**: Vote-based system
4. **Presence Tracking**: Active users in room
5. **Message Search**: Full-text search via MongoDB text indexes
6. **Analytics**: Track message volume, active users
7. **Message Encryption**: End-to-end encryption option
8. **Notifications**: Push notifications for new messages

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify JWT token is valid and not expired
3. Ensure user is a member of the room
4. Check MongoDB connection status
5. Review Socket.IO CORS configuration

