import { getDatabase } from '../../config/firebase';
import { ChatMessageModel, ChatMessageDTO } from './chat.model';
import { v4 as uuidv4 } from 'uuid';

/**
 * Chat Service for Firebase Realtime Database
 * Handles all message operations for rooms
 */

export class ChatService {
  private db = getDatabase();

  /**
   * Send a message to a room
   * Stores in Firebase Realtime Database + MongoDB backup
   */
  async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    message: string,
    senderImage?: string
  ): Promise<ChatMessageDTO> {
    try {
      const messageId = uuidv4();
      const now = new Date();
      const createdAt = now.toISOString();

      const messageData: ChatMessageDTO = {
        _id: messageId,
        roomId,
        senderId,
        senderName,
        senderImage,
        message: message.trim(),
        createdAt,
        seenBy: [senderId], // Sender has seen their own message
      };

      // Store in Firebase Realtime Database
      await this.db
        .ref(`rooms/${roomId}/messages/${messageId}`)
        .set(messageData);

      // Also save to MongoDB for backup and search capability
      try {
        await ChatMessageModel.create({
          roomId,
          senderId,
          senderName,
          senderImage,
          message: message.trim(),
          createdAt: now,
          seenBy: [senderId],
        });
      } catch (mongoError) {
        console.warn('MongoDB backup failed:', mongoError);
        // Don't fail the request if MongoDB backup fails
      }

      console.log(`✓ Message sent: ${messageId} in room ${roomId}`);
      return messageData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  }

  /**
   * Get messages for a room with pagination
   */
  async getMessages(
    roomId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<ChatMessageDTO[]> {
    try {
      let query = this.db
        .ref(`rooms/${roomId}/messages`)
        .orderByChild('createdAt');

      if (cursor) {
        // For cursor-based pagination, get messages before cursor timestamp
        query = query.endAt(new Date(cursor).getTime());
      }

      const snapshot = await query.limitToLast(limit + 1).get();

      if (!snapshot.exists()) {
        return [];
      }

      const messagesObj = snapshot.val();
      const messages: ChatMessageDTO[] = Object.values(messagesObj);

      // Sort by createdAt ascending (oldest first)
      messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Remove the extra one from cursor
      if (cursor && messages.length > limit) {
        messages.shift();
      }

      return messages.slice(0, limit);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Get real-time listener for room messages
   */
  onMessagesChange(
    roomId: string,
    callback: (messages: ChatMessageDTO[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const ref = this.db.ref(`rooms/${roomId}/messages`);

    const listener = ref.on(
      'value',
      (snapshot) => {
        if (snapshot.exists()) {
          const messagesObj = snapshot.val();
          const messages: ChatMessageDTO[] = Object.values(messagesObj);

          // Sort by createdAt ascending
          messages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          callback(messages);
        } else {
          callback([]);
        }
      },
      onError
    );

    // Return unsubscribe function
    return () => {
      ref.off();
    };
  }

  /**
   * Mark message as seen by user
   */
  async markMessageSeen(
    roomId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      const messageRef = this.db.ref(`rooms/${roomId}/messages/${messageId}`);
      const snapshot = await messageRef.get();

      if (snapshot.exists()) {
        const message = snapshot.val() as ChatMessageDTO;

        // Add userId to seenBy if not already there
        if (!message.seenBy.includes(userId)) {
          message.seenBy.push(userId);
          await messageRef.update({ seenBy: message.seenBy });
        }
      }
    } catch (error) {
      console.error('Error marking message as seen:', error);
    }
  }

  /**
   * Mark all messages in room as seen by user
   */
  async markAllMessagesSeen(roomId: string, userId: string): Promise<void> {
    try {
      const snapshot = await this.db.ref(`rooms/${roomId}/messages`).get();

      if (!snapshot.exists()) {
        return;
      }

      const messagesObj = snapshot.val();
      const updates: { [key: string]: ChatMessageDTO } = {};

      for (const messageId in messagesObj) {
        const message = messagesObj[messageId] as ChatMessageDTO;

        if (!message.seenBy.includes(userId)) {
          message.seenBy.push(userId);
          updates[`rooms/${roomId}/messages/${messageId}`] = message;
        }
      }

      if (Object.keys(updates).length > 0) {
        await this.db.ref().update(updates);
      }
    } catch (error) {
      console.error('Error marking all messages as seen:', error);
    }
  }

  /**
   * Delete a message (only sender or room admin can delete)
   */
  async deleteMessage(
    roomId: string,
    messageId: string,
    userId: string,
    userRole: 'member' | 'admin'
  ): Promise<void> {
    try {
      const messageRef = this.db.ref(`rooms/${roomId}/messages/${messageId}`);
      const snapshot = await messageRef.get();

      if (!snapshot.exists()) {
        throw new Error('Message not found');
      }

      const message = snapshot.val() as ChatMessageDTO;

      // Only allow sender or admin to delete
      if (message.senderId !== userId && userRole !== 'admin') {
        throw new Error('You do not have permission to delete this message');
      }

      await messageRef.remove();

      // Also delete from MongoDB backup
      try {
        await ChatMessageModel.deleteOne({ _id: messageId });
      } catch (mongoError) {
        console.warn('MongoDB backup deletion failed:', mongoError);
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete message'
      );
    }
  }

  /**
   * Search messages in a room
   */
  async searchMessages(
    roomId: string,
    query: string
  ): Promise<ChatMessageDTO[]> {
    try {
      // Try to search in MongoDB for better performance
      const results = await ChatMessageModel.find({
        roomId,
        message: { $regex: query, $options: 'i' },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return results.map((doc) => ({
        _id: doc._id.toString(),
        roomId: doc.roomId,
        senderId: doc.senderId,
        senderName: doc.senderName,
        senderImage: doc.senderImage,
        message: doc.message,
        createdAt: doc.createdAt.toISOString(),
        seenBy: doc.seenBy,
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Delete all messages in a room (admin/creator only)
   */
  async deleteAllMessagesInRoom(roomId: string): Promise<void> {
    try {
      await this.db.ref(`rooms/${roomId}/messages`).remove();

      // Also delete from MongoDB
      try {
        await ChatMessageModel.deleteMany({ roomId });
      } catch (mongoError) {
        console.warn('MongoDB cleanup failed:', mongoError);
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete messages'
      );
    }
  }

  /**
   * Get message count in room
   */
  async getMessageCount(roomId: string): Promise<number> {
    try {
      const snapshot = await this.db.ref(`rooms/${roomId}/messages`).get();
      return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
