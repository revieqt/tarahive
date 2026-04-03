import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { MessageModel } from '../modules/room/message.model';
import { RoomModel } from '../modules/room/room.model';
import { sendSystemMessageService } from '../modules/room/message.controller';

/**
 * Decode JWT token and extract userID
 */
const decodeToken = (token: string): string | null => {
  try {
    const secretKey = process.env.JWT_SECRET || 'default_secret';
    const decoded: any = jwt.verify(token, secretKey);
    return decoded.userId || null;
  } catch (error) {
    console.error('🔴 Token decode error:', error);
    return null;
  }
};

/**
 * Verify user is a member of the room with status "member"
 */
const verifyRoomMembership = async (userId: string, roomId: string): Promise<boolean> => {
  try {
    const room = await RoomModel.findById(roomId);
    if (!room) return false;

    return room.members.some((m) => m.userID === userId && m.status === 'member');
  } catch (error) {
    console.error('🔴 Error verifying room membership:', error);
    return false;
  }
};

/**
 * Initialize Socket.IO event handlers
 */
export const initializeChatSocket = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log('🔴 Socket connection - No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const userId = decodeToken(token);
      if (!userId) {
        console.log('🔴 Socket connection - Invalid token');
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach userId to socket for later use
      (socket as any).userId = userId;
      console.log(`✅ Socket authenticated: ${userId}`);
      next();
    } catch (error) {
      console.error('🔴 Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`🟢 User connected: ${userId} (Socket ID: ${socket.id})`);

    /**
     * Event: join_room
     * Allows user to join a room's socket namespace
     * Validates user is a member with status "member"
     */
    socket.on('join_room', async (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;

        if (!roomId) {
          console.log('🔴 join_room - No roomId provided');
          return callback?.(false, 'Room ID is required');
        }

        console.log(`🔵 join_room - User ${userId} joining room ${roomId}`);

        // Verify user is a member of the room
        const isMember = await verifyRoomMembership(userId, roomId);
        if (!isMember) {
          console.log(`🔴 join_room - User ${userId} is not a member of room ${roomId}`);
          return callback?.(false, 'Access denied: User is not a member of this room');
        }

        // Join the socket to the room
        socket.join(roomId);
        console.log(`✅ join_room - User ${userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId,
          timestamp: new Date().toISOString(),
        });

        callback?.(true, 'Joined room successfully');
      } catch (error) {
        console.error('🔴 Error in join_room:', error);
        callback?.(false, 'Internal server error');
      }
    });

    /**
     * Event: send_message
     * Saves message to MongoDB and emits to all users in the room
     */
    socket.on('send_message', async (data: { roomId: string; message: string }, callback) => {
      try {
        const { roomId, message } = data;

        if (!roomId || !message || !message.trim()) {
          console.log('🔴 send_message - Invalid data');
          return callback?.(false, 'Room ID and message content are required');
        }

        console.log(`🔵 send_message - User ${userId} sending message to room ${roomId}`);

        // Verify user is a member of the room
        const isMember = await verifyRoomMembership(userId, roomId);
        if (!isMember) {
          console.log(`🔴 send_message - User ${userId} is not a member of room ${roomId}`);
          return callback?.(false, 'Access denied: User is not a member of this room');
        }

        // Create and save message to MongoDB
        const newMessage = new MessageModel({
          roomId,
          senderId: userId,
          message: message.trim(),
          createdAt: new Date(),
          seenBy: [userId],
        });

        await newMessage.save();
        console.log(`✅ send_message - Message saved: ${newMessage._id}`);

        // Update room's lastMessage (bonus feature)
        await RoomModel.findByIdAndUpdate(
          roomId,
          {
            lastMessage: message.substring(0, 100),
            lastMessageAt: new Date(),
          },
          { new: true }
        );

        // Prepare message data for broadcast
        const messageData = {
          _id: newMessage._id,
          roomId,
          senderId: userId,
          message: newMessage.message,
          createdAt: newMessage.createdAt,
          seenBy: [userId],
        };

        // Emit to all users in the room (including sender)
        io.to(roomId).emit('receive_message', messageData);
        console.log(`✅ send_message - Broadcasted to room ${roomId}`);

        callback?.(true, { messageId: newMessage._id });
      } catch (error) {
        console.error('🔴 Error in send_message:', error);
        callback?.(false, 'Failed to send message');
      }
    });

    /**
     * Event: typing
     * Broadcasts typing indicator to all other users in the room
     */
    socket.on('typing', (data: { roomId: string; isTyping: boolean }, callback) => {
      try {
        const { roomId, isTyping } = data;

        if (!roomId) {
          return callback?.(false, 'Room ID is required');
        }

        console.log(`🔵 typing - User ${userId} is ${isTyping ? 'typing' : 'stopped typing'} in room ${roomId}`);

        // Broadcast to others in the room (NOT including sender)
        socket.to(roomId).emit('user_typing', {
          userId,
          isTyping,
          timestamp: new Date().toISOString(),
        });

        callback?.(true);
      } catch (error) {
        console.error('🔴 Error in typing:', error);
        callback?.(false, 'Internal server error');
      }
    });

    /**
     * Event: mark_seen
     * Marks messages as seen by the user
     */
    socket.on('mark_seen', async (data: { roomId: string; messageIds: string[] }, callback) => {
      try {
        const { roomId, messageIds } = data;

        if (!roomId || !messageIds || messageIds.length === 0) {
          return callback?.(false, 'Room ID and message IDs are required');
        }

        console.log(`🔵 mark_seen - User ${userId} marking ${messageIds.length} messages as seen`);

        // Update messages to add userId to seenBy array
        const result = await MessageModel.updateMany(
          {
            _id: { $in: messageIds },
            roomId,
            seenBy: { $ne: userId },
          },
          {
            $addToSet: { seenBy: userId },
          }
        );

        console.log(`✅ mark_seen - Updated ${result.modifiedCount} messages`);

        // Broadcast to all users in the room
        io.to(roomId).emit('messages_seen', {
          userId,
          messageIds,
          timestamp: new Date().toISOString(),
        });

        callback?.(true, { markedCount: result.modifiedCount });
      } catch (error) {
        console.error('🔴 Error in mark_seen:', error);
        callback?.(false, 'Failed to mark messages as seen');
      }
    });

    /**
     * Event: system_message (server-side only)
     * Backend can use this to broadcast system messages to a room
     * Used for notifications, alerts, room announcements
     */
    socket.on('system_message', async (data: { roomId: string; message: string }, callback) => {
      try {
        const { roomId, message } = data;

        if (!roomId || !message || !message.trim()) {
          return callback?.(false, 'Room ID and message are required');
        }

        console.log(`🔵 system_message - Sending system message to room ${roomId}`);

        // Save system message to MongoDB
        const systemMessage = await sendSystemMessageService(roomId, message);
        console.log(`✅ system_message - System message saved: ${systemMessage._id}`);

        // Broadcast to all users in the room
        io.to(roomId).emit('receive_message', {
          _id: systemMessage._id,
          roomId,
          senderId: 'SYSTEM',
          message: systemMessage.message,
          createdAt: systemMessage.createdAt,
          seenBy: [],
          isSystemMessage: true,
        });

        callback?.(true, { messageId: systemMessage._id });
      } catch (error) {
        console.error('🔴 Error in system_message:', error);
        callback?.(false, 'Failed to send system message');
      }
    });

    /**
     * Event: leave_room
     * Allows user to leave a room
     */
    socket.on('leave_room', (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;

        if (!roomId) {
          return callback?.(false, 'Room ID is required');
        }

        console.log(`🔵 leave_room - User ${userId} leaving room ${roomId}`);

        socket.leave(roomId);
        console.log(`✅ leave_room - User ${userId} left room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_left', {
          userId,
          timestamp: new Date().toISOString(),
        });

        callback?.(true, 'Left room successfully');
      } catch (error) {
        console.error('🔴 Error in leave_room:', error);
        callback?.(false, 'Internal server error');
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${userId} (Socket ID: ${socket.id})`);
      // Notify all connected clients if needed
      io.emit('user_offline', {
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Handle connection errors
     */
    socket.on('connect_error', (error) => {
      console.error(`🔴 Connection error for user ${userId}:`, error);
    });
  });

  console.log('✅ Socket.IO chat initialized');
};
