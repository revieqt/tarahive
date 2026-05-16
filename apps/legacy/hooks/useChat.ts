import { useState, useEffect, useRef, useCallback } from 'react';
import chatService, { Message } from '@/services/chatService';

/**
 * useChat Hook
 * Manages real-time message state and polling
 */

export interface UseChatOptions {
  pollInterval?: number; // Milliseconds between polls (default: 3000)
  autoMarkSeen?: boolean; // Auto-mark messages as seen (default: true)
  fetchLimit?: number; // Number of messages to fetch (default: 50)
}

export const useChat = (roomId: string | null, options: UseChatOptions = {}) => {
  const {
    pollInterval = 3000,
    autoMarkSeen = true,
    fetchLimit = 50,
  } = options;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastFetchTimeRef = useRef<string>(new Date().toISOString());

  /**
   * Fetch messages from backend
   */
  const fetchMessages = useCallback(async (isInitial: boolean = false) => {
    if (!roomId) return;

    try {
      if (isInitial) {
        setIsLoading(true);
      }

      const newMessages = await chatService.getMessages(
        roomId,
        fetchLimit,
        isInitial ? undefined : lastFetchTimeRef.current
      );

      if (!isMountedRef.current) return;

      if (isInitial) {
        // Initial load: replace all messages
        setMessages(newMessages);
      } else {
        // Polling: merge new messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newMessagesToAdd = newMessages.filter(
            (m) => !existingIds.has(m._id)
          );

          return [...prev, ...newMessagesToAdd];
        });
      }

      if (newMessages.length > 0) {
        lastFetchTimeRef.current = newMessages[newMessages.length - 1].createdAt;
      }

      setError(null);
      if (isInitial) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (isInitial) {
        setError(
          err instanceof Error ? err.message : 'Failed to load messages'
        );
        setIsLoading(false);
      }
    }
  }, [roomId, fetchLimit]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !roomId) {
        throw new Error('Invalid message or room');
      }

      try {
        setIsSending(true);
        setError(null);

        const newMessage = await chatService.sendMessage(roomId, messageText);

        if (isMountedRef.current) {
          setMessages((prev) => [...prev, newMessage]);
          lastFetchTimeRef.current = newMessage.createdAt;
        }

        return newMessage;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsSending(false);
      }
    },
    [roomId]
  );

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!roomId) return;

      try {
        await chatService.deleteMessage(roomId, messageId);

        if (isMountedRef.current) {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to delete message';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [roomId]
  );

  /**
   * Mark all messages as seen
   */
  const markAllSeen = useCallback(async () => {
    if (!roomId) return;

    try {
      await chatService.markAllSeen(roomId);

      if (isMountedRef.current) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            seenBy: Array.from(new Set([...m.seenBy])),
          }))
        );
      }
    } catch (err) {
      console.error('Error marking messages as seen:', err);
    }
  }, [roomId]);

  /**
   * Initialize and start polling
   */
  useEffect(() => {
    isMountedRef.current = true;
    lastFetchTimeRef.current = new Date().toISOString();

    // Initial fetch
    fetchMessages(true);

    // Start polling for new messages
    const startPolling = () => {
      pollTimerRef.current = setInterval(() => {
        fetchMessages(false);
      }, pollInterval);
    };

    startPolling();

    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [roomId, pollInterval, fetchMessages]);

  return {
    // State
    messages,
    isLoading,
    error,
    isSending,

    // Actions
    sendMessage,
    deleteMessage,
    markAllSeen,
    refetch: () => fetchMessages(true),
  };
};

export default useChat;
