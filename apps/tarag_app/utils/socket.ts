import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from './getAccessToken';

/**
 * Socket.IO client instance for real-time chat communication
 * Manages connection lifecycle, authentication, and event handling
 */
class ChatSocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnecting: boolean = false;

  /**
   * Initialize socket connection with authentication
   */
  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('🟢 Socket already connected:', this.socket.id);
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('🟡 Socket connection in progress, waiting...');
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConnection);
            console.log('🟢 Socket now connected:', this.socket?.id);
            resolve(this.socket!);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkConnection);
          console.error('🔴 Socket connection timeout while waiting');
          reject(new Error('Socket connection timeout'));
        }, 15000);
      });
    }

    try {
      this.isConnecting = true;
      console.log('🟡 Fetching access token...');
      
      this.token = await getAccessToken();
      
      if (!this.token) {
        throw new Error('Access token is empty');
      }
      
      console.log('🟡 Token fetched, connecting to:', BACKEND_URL);

      this.socket = io(BACKEND_URL, {
        auth: {
          token: this.token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        secure: true,
        rejectUnauthorized: false,
      });

      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          console.error('🔴 Socket connection timeout after 15 seconds');
          this.isConnecting = false;
          if (this.socket && !this.socket.connected) {
            this.socket.close();
            this.socket = null;
          }
          reject(new Error('Socket connection timeout'));
        }, 15000);

        this.socket?.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log('✅ Socket connected, ID:', this.socket?.id);
          this.isConnecting = false;
          resolve(this.socket!);
        });

        this.socket?.on('connect_error', (error: any) => {
          clearTimeout(connectionTimeout);
          console.error('🔴 Socket connection error:', error?.message || error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket?.on('error', (error: any) => {
          console.error('🔴 Socket error:', error?.message || error);
        });
      });
    } catch (error) {
      console.error('🔴 Failed to initialize socket:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Join a room for real-time messaging
   */
  async joinRoom(roomId: string): Promise<boolean> {
    try {
      console.log(`🟡 Attempting to join room: ${roomId}`);
      const socket = await this.connect();

      return new Promise((resolve, reject) => {
        const roomJoinTimeout = setTimeout(() => {
          console.error(`🔴 join_room timeout for room: ${roomId}`);
          reject(new Error(`join_room timeout for room ${roomId}`));
        }, 10000);

        socket.emit('join_room', { roomId }, (success: boolean, message?: string) => {
          clearTimeout(roomJoinTimeout);
          if (success) {
            console.log(`✅ Joined room: ${roomId}`);
            resolve(true);
          } else {
            console.error(`🔴 Failed to join room: ${message}`);
            reject(new Error(message || 'Failed to join room'));
          }
        });
      });
    } catch (error) {
      console.error('🔴 Error joining room:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.log(`🟡 Socket not connected, cannot leave room ${roomId}`);
      return;
    }

    console.log(`🟡 Leaving room: ${roomId}`);
    this.socket.emit('leave_room', { roomId }, (success: boolean) => {
      if (success) {
        console.log(`✅ Left room: ${roomId}`);
      } else {
        console.error(`🔴 Failed to leave room: ${roomId}`);
      }
    });

    // Remove all listeners
    this.socket.off('receive_message');
    this.socket.off('user_typing');
    this.socket.off('messages_seen');
    this.socket.off('user_joined');
    this.socket.off('user_left');
  }

  /**
   * Send a message to a room
   */
  async sendMessage(roomId: string, message: string): Promise<string> {
    try {
      console.log(`🟡 Sending message to room ${roomId}`);
      const socket = await this.connect();

      return new Promise((resolve, reject) => {
        const sendTimeout = setTimeout(() => {
          console.error('🔴 send_message timeout');
          reject(new Error('Failed to send message: timeout'));
        }, 10000);

        socket.emit('send_message', { roomId, message }, (success: boolean, data?: any) => {
          clearTimeout(sendTimeout);
          if (success) {
            console.log('✅ Message sent');
            resolve(data?.messageId || '');
          } else {
            console.error('🔴 Failed to send message:', data);
            reject(new Error(data || 'Failed to send message'));
          }
        });
      });
    } catch (error) {
      console.error('🔴 Error sending message:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Listen for incoming messages
   */
  onReceiveMessage(callback: (message: any) => void): void {
    if (!this.socket) return;
    this.socket.on('receive_message', callback);
  }

  /**
   * Stop listening for incoming messages
   */
  offReceiveMessage(callback?: (message: any) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('receive_message', callback);
    } else {
      this.socket.off('receive_message');
    }
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void): void {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  /**
   * Stop listening for typing indicators
   */
  offUserTyping(callback?: (data: { userId: string; isTyping: boolean }) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('user_typing', callback);
    } else {
      this.socket.off('user_typing');
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(roomId: string, isTyping: boolean): Promise<void> {
    try {
      const socket = await this.connect();
      socket.emit('typing', { roomId, isTyping }, (success: boolean) => {
        if (success) {
          console.log(`✅ Typing indicator sent: ${isTyping}`);
        } else {
          console.error('🔴 Failed to send typing indicator');
        }
      });
    } catch (error) {
      console.error('🔴 Error sending typing indicator:', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Mark messages as seen
   */
  async markMessagesSeen(roomId: string, messageIds: string[]): Promise<void> {
    try {
      console.log(`🟡 Marking ${messageIds.length} messages as seen`);
      const socket = await this.connect();

      return new Promise((resolve, reject) => {
        const markSeenTimeout = setTimeout(() => {
          console.error('🔴 mark_seen timeout');
          reject(new Error('Failed to mark messages as seen: timeout'));
        }, 10000);

        socket.emit('mark_seen', { roomId, messageIds }, (success: boolean, data?: any) => {
          clearTimeout(markSeenTimeout);
          if (success) {
            console.log('✅ Messages marked as seen');
            resolve();
          } else {
            console.error('🔴 Failed to mark messages as seen:', data);
            reject(new Error(data || 'Failed to mark messages as seen'));
          }
        });
      });
    } catch (error) {
      console.error('🔴 Error marking messages as seen:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Listen for messages marked as seen
   */
  onMessagesSeen(callback: (data: { userId: string; messageIds: string[] }) => void): void {
    if (!this.socket) return;
    this.socket.on('messages_seen', callback);
  }

  /**
   * Stop listening for messages marked as seen
   */
  offMessagesSeen(callback?: (data: { userId: string; messageIds: string[] }) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('messages_seen', callback);
    } else {
      this.socket.off('messages_seen');
    }
  }

  /**
   * Listen for user joined events
   */
  onUserJoined(callback: (data: { userId: string; timestamp: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('user_joined', callback);
  }

  /**
   * Listen for user left events
   */
  onUserLeft(callback: (data: { userId: string; timestamp: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('user_left', callback);
  }

  /**
   * Listen for general connection errors
   */
  onError(callback: (error: Error) => void): void {
    if (!this.socket) return;
    this.socket.on('error', callback);
  }

  /**
   * Listen for disconnection
   */
  onDisconnect(callback: () => void): void {
    if (!this.socket) return;
    this.socket.on('disconnect', callback);
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
      console.log('✅ Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const chatSocket = new ChatSocketClient();

export default chatSocket;
