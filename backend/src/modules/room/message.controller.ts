import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MessageModel } from './message.model';
import { RoomModel } from './room.model';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Helper: Extract token from Authorization header
 */
const extractToken = (authHeader: string | string[] | undefined): string | undefined => {
  if (!authHeader) return undefined;
  
  const headerStr = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const parts = headerStr.split(' ');
  return parts.length > 1 ? parts[1] : undefined;
};

/**
 * Helper: Convert query param to string
 */
const toStr = (value: any): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] as string;
  return String(value);
};

/**
 * Decode JWT token and extract userID
 */
const decodeTokenAndGetUserID = (token: string): string => {
  try {
    const secretKey = process.env.JWT_SECRET || 'default_secret';
    const decoded: any = jwt.verify(token, secretKey);
    if (!decoded.userId) {
      throw new Error('Invalid token: userId not found');
    }
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify user is a member of the room with status "member"
 */
const verifyRoomMembership = async (userId: string, roomId: string): Promise<boolean> => {
  try {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const isMember = room.members.some(
      (m) => m.userID === userId && m.status === 'member'
    );

    return isMember;
  } catch (error) {
    console.error('Error verifying room membership:', error);
    return false;
  }
};

/**
 * A. Get messages for a room (cursor-based pagination)
 * GET /api/messages/:roomId
 * Query params:
 *   - limit: number of messages to return (default: 20, max: 100)
 *   - cursor: timestamp cursor for pagination (optional)
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔵 getMessages - Received request');
    const token = extractToken(req.headers['authorization']);
    const roomId = toStr(req.params.roomId);
    const limitStr = toStr(req.query.limit || '20');
    const cursorStr = req.query.cursor ? toStr(req.query.cursor) : undefined;

    if (!token) {
      console.log('❌ getMessages - No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!roomId) {
      console.log('❌ getMessages - No roomId provided');
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Decode token and get userID
    const userId = decodeTokenAndGetUserID(token);
    console.log(`🔵 getMessages - UserID: ${userId}, RoomID: ${roomId}`);

    // Verify user is a member of the room with status "member"
    const isMember = await verifyRoomMembership(userId, roomId);
    if (!isMember) {
      console.log('❌ getMessages - User is not a member of this room');
      return res.status(403).json({
        message: 'Access denied: User is not a member of this room',
      });
    }

    // Parse and validate limit
    let messageLimit = parseInt(limitStr, 10);
    if (isNaN(messageLimit) || messageLimit < 1) messageLimit = 20;
    if (messageLimit > 100) messageLimit = 100;

    // Build query
    const query: any = { roomId };
    if (cursorStr) {
      // Cursor pagination: fetch messages before the cursor
      const cursorDate = new Date(cursorStr);
      query.createdAt = { $lt: cursorDate };
    }

    // Fetch messages with limit + 1 to determine if there are more
    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(messageLimit + 1)
      .lean();

    // Check if there are more messages
    const hasMore = messages.length > messageLimit;
    const paginatedMessages = messages.slice(0, messageLimit);

    // Get next cursor (oldest message's timestamp)
    const nextCursor =
      paginatedMessages.length > 0
        ? paginatedMessages[paginatedMessages.length - 1].createdAt.toISOString()
        : null;

    console.log(`✅ getMessages - Returning ${paginatedMessages.length} messages`);
    res.status(200).json({
      message: 'Messages retrieved successfully',
      data: {
        messages: paginatedMessages,
        pagination: {
          nextCursor: hasMore ? nextCursor : null,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in getMessages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Invalid or expired token')) {
      return res.status(403).json({ message: errorMessage });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};

/**
 * B. Create a message (fallback REST endpoint)
 * POST /api/messages
 * Body: { roomId, senderId, message }
 */
export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔵 createMessage - Received request');
    const token = extractToken(req.headers['authorization']);
    const { roomId, senderId, message } = req.body;

    if (!token) {
      console.log('❌ createMessage - No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!roomId || !senderId || !message) {
      console.log('❌ createMessage - Missing required fields');
      return res.status(400).json({
        message: 'roomId, senderId, and message are required',
      });
    }

    // Decode token and verify it matches senderId
    const tokenUserId = decodeTokenAndGetUserID(token);
    if (tokenUserId !== senderId) {
      console.log('❌ createMessage - Token userId does not match senderId');
      return res.status(403).json({
        message: 'Access denied: Cannot send message on behalf of another user',
      });
    }

    // Verify user is a member of the room
    const isMember = await verifyRoomMembership(senderId, roomId);
    if (!isMember) {
      console.log('❌ createMessage - User is not a member of this room');
      return res.status(403).json({
        message: 'Access denied: User is not a member of this room',
      });
    }

    // Create and save message
    const newMessage = new MessageModel({
      roomId,
      senderId,
      message: message.trim(),
      createdAt: new Date(),
      seenBy: [senderId],
    });

    await newMessage.save();
    console.log(`✅ createMessage - Message created: ${newMessage._id}`);

    // Update room's lastMessage (bonus feature)
    await RoomModel.findByIdAndUpdate(
      roomId,
      {
        lastMessage: message.substring(0, 100),
        lastMessageAt: new Date(),
      },
      { new: true }
    );

    res.status(201).json({
      message: 'Message created successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('❌ Error in createMessage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Invalid or expired token')) {
      return res.status(403).json({ message: errorMessage });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};

/**
 * C. Mark messages as seen
 * POST /api/messages/mark-seen
 * Body: { roomId, messageIds }
 */
export const markMessagesSeen = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔵 markMessagesSeen - Received request');
    const token = extractToken(req.headers['authorization']);
    const { roomId, messageIds } = req.body;

    if (!token) {
      console.log('❌ markMessagesSeen - No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!roomId || !messageIds || messageIds.length === 0) {
      console.log('❌ markMessagesSeen - Missing required fields');
      return res.status(400).json({
        message: 'roomId and messageIds are required',
      });
    }

    // Decode token
    const userId = decodeTokenAndGetUserID(token);
    console.log(`🔵 markMessagesSeen - UserID: ${userId}`);

    // Verify user is a member
    const isMember = await verifyRoomMembership(userId, roomId);
    if (!isMember) {
      console.log('❌ markMessagesSeen - User is not a member of this room');
      return res.status(403).json({
        message: 'Access denied: User is not a member of this room',
      });
    }

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

    console.log(`✅ markMessagesSeen - Updated ${result.modifiedCount} messages`);
    res.status(200).json({
      message: 'Messages marked as seen',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error in markMessagesSeen:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Invalid or expired token')) {
      return res.status(403).json({ message: errorMessage });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};

/**
 * D. Service function to send system messages (callable from anywhere)
 * Can be used for notifications, alerts, room announcements, etc.
 * System messages are from senderId: "SYSTEM"
 */
export const sendSystemMessageService = async (roomId: string, message: string): Promise<any> => {
  try {
    console.log(`🔵 sendSystemMessageService - Sending system message to room ${roomId}`);

    // Verify room exists
    const room = await RoomModel.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Create system message
    const newMessage = new MessageModel({
      roomId,
      senderId: 'SYSTEM',
      message: message.trim(),
      createdAt: new Date(),
      seenBy: [], // System messages visible to all,no need to track seen
    });

    await newMessage.save();
    console.log(`✅ sendSystemMessageService - System message saved: ${newMessage._id}`);

    // Update room's lastMessage
    await RoomModel.findByIdAndUpdate(
      roomId,
      {
        lastMessage: `[System] ${message.substring(0, 90)}`,
        lastMessageAt: new Date(),
      },
      { new: true }
    );

    return newMessage;
  } catch (error) {
    console.error('❌ Error in sendSystemMessageService:', error);
    throw error;
  }
};

/**
 * D. Send system message to a room
 * POST /api/messages/system
 * Body: { roomId, message }
 * 
 * Security: Requires X-API-KEY header or admin token
 */
export const sendSystemMessage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔵 sendSystemMessage - Received request');
    const { roomId, message } = req.body;
    const apiKey = req.headers['x-api-key'];
    const token = extractToken(req.headers['authorization']);

    // Convert to string for comparison
    const expectedApiKey = process.env.SYSTEM_API_KEY || 'system_key_not_set';
    const isValidApiKey = apiKey && apiKey === expectedApiKey;
    const isAdminToken = token ? decodeTokenAndGetUserID(token) : null;

    // Allow either valid API key or admin user
    if (!isValidApiKey && !isAdminToken) {
      console.log('❌ sendSystemMessage - Unauthorized');
      return res.status(401).json({
        message: 'Access denied. Valid API key or admin token required.',
      });
    }

    if (!roomId || !message) {
      console.log('❌ sendSystemMessage - Missing required fields');
      return res.status(400).json({
        message: 'roomId and message are required',
      });
    }

    // Send system message
    const systemMessage = await sendSystemMessageService(roomId, message);

    console.log(`✅ sendSystemMessage - System message sent`);
    res.status(201).json({
      message: 'System message sent successfully',
      data: systemMessage,
    });
  } catch (error) {
    console.error('❌ Error in sendSystemMessage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Room not found')) {
      return res.status(404).json({ message: errorMessage });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};
