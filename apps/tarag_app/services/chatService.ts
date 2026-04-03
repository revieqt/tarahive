import axios from 'axios';
import { BACKEND_URL } from '../constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

/**
 * Firebase Chat Service
 * Frontend API client for Firebase Realtime Database chat operations
 * Communicates with backend via REST API
 */

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  message: string;
  createdAt: string;
  seenBy: string[];
}

class ChatService {
  private client = axios.create({
    baseURL: `${BACKEND_URL}/api/chat`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Set authentication token (called automatically in each request)
   */
  private async setAuthToken() {
    try {
      const token = await getAccessToken();
      if (token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve auth token:', error);
    }
  }

  /**
   * Get messages for a room from Firebase via backend
   * @param roomId - Room ID
   * @param limit - Max number of messages to fetch (default 50)
   * @param cursor - Optional cursor for pagination
   */
  async getMessages(
    roomId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<Message[]> {
    await this.setAuthToken();
    try {
      const response = await this.client.get(`/${roomId}`, {
        params: { limit, cursor },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send a message to a room
   * Stores in Firebase Realtime Database via backend
   */
  async sendMessage(roomId: string, message: string): Promise<Message> {
    await this.setAuthToken();
    try {
      const response = await this.client.post(`/${roomId}/send`, {
        message,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  }

  /**
   * Mark a specific message as seen by the user
   */
  async markMessageSeen(roomId: string, messageId: string): Promise<void> {
    await this.setAuthToken();
    try {
      await this.client.put(`/${roomId}/messages/${messageId}/seen`);
    } catch (error) {
      console.error('Error marking message as seen:', error);
    }
  }

  /**
   * Mark all messages in a room as seen
   */
  async markAllSeen(roomId: string): Promise<void> {
    await this.setAuthToken();
    try {
      await this.client.put(`/${roomId}/mark-all-seen`);
    } catch (error) {
      console.error('Error marking all messages as seen:', error);
    }
  }

  /**
   * Delete a message (only sender or admin can delete)
   */
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    await this.setAuthToken();
    try {
      await this.client.delete(`/${roomId}/messages/${messageId}`);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete message'
      );
    }
  }

  /**
   * Search messages in a room
   */
  async searchMessages(roomId: string, query: string): Promise<Message[]> {
    await this.setAuthToken();
    try {
      const response = await this.client.get(`/${roomId}/search`, {
        params: { q: query },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get total message count for a room
   */
  async getMessageCount(roomId: string): Promise<number> {
    await this.setAuthToken();
    try {
      const response = await this.client.get(`/${roomId}/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
