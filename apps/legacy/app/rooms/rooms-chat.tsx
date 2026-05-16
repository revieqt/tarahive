import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import BackButton from '@/components/BackButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatHeader, ChatField, ChatBubble } from '@/components/Chat';
import { getMessages, Message, markMessagesSeen } from '@/services/roomService';
import { useGetSpecificRoom } from '@/hooks/useRoom';
import { useSession } from '@/context/SessionContext';
import chatSocket from '@/utils/socket';

interface TypingUser {
  userId: string;
  timestamp: number;
}

/**
 * Real-time chat screen for room-based messaging
 * Features:
 * - Real-time message receiving via Socket.IO
 * - Message history fetching via REST
 * - Typing indicators
 * - Automatic scroll to latest messages
 * - Optimistic UI updates for sent messages
 */
export default function RoomChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user?.id;

  // Debug logging
  useEffect(() => {
    console.log('=== CHAT SCREEN DEBUG ===');
    console.log('Room ID from params:', id);
    console.log('User ID from session:', userId);
    console.log('Session user:', session?.user);
  }, [id, userId, session]);

  // Theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  // Room data
  const { data: room, isLoading: isRoomLoading, error: roomError } = useGetSpecificRoom(id);

  // Local state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageListenerRef = useRef<((message: any) => void) | null>(null);
  const typingListenerRef = useRef<((data: any) => void) | null>(null);
  const seenListenerRef = useRef<((data: any) => void) | null>(null);

  /**
   * Initialize socket connection and fetch initial messages
   */
  useEffect(() => {
    if (!id) {
      console.log('Chat: No room ID available');
      setIsLoadingMessages(false);
      return;
    }

    if (!userId) {
      console.log('Chat: No user ID available');
      setIsLoadingMessages(false);
      return;
    }

    let isMounted = true;
    const initializeChat = async () => {
      try {
        console.log(`Chat: Initializing for room ${id}, user ${userId}`);
        
        // Fetch initial messages
        const initialMessages = await getMessages(id, 50);
        
        if (!isMounted) return;
        
        console.log(`Chat: Fetched ${initialMessages.length} messages`);
        setMessages(initialMessages);
        setIsLoadingMessages(false);

        // Connect and join room socket
        try {
          console.log('Chat: Connecting socket...');
          await chatSocket.connect();
          await chatSocket.joinRoom(id);
          console.log('Chat: Socket connected and joined room');
        } catch (socketError) {
          console.error('Chat: Socket error:', socketError);
          if (isMounted) {
            setError(`Failed to connect to chat: ${socketError instanceof Error ? socketError.message : 'Unknown error'}`);
          }
          return;
        }

        if (!isMounted) return;

        // Setup message listener
        messageListenerRef.current = (incomingMessage: Message) => {
          if (incomingMessage.roomId === id && isMounted) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m._id === incomingMessage._id)) {
                return prev;
              }
              return [...prev, incomingMessage];
            });
          }
        };
        chatSocket.onReceiveMessage(messageListenerRef.current);

        // Setup typing listener
        typingListenerRef.current = (data: { userId: string; isTyping: boolean }) => {
          if (data.userId === userId || !isMounted) return;

          setTypingUsers((prev) => {
            const updated = new Map(prev);
            if (data.isTyping) {
              updated.set(data.userId, {
                userId: data.userId,
                timestamp: Date.now(),
              });
            } else {
              updated.delete(data.userId);
            }
            return updated;
          });
        };
        chatSocket.onUserTyping(typingListenerRef.current);

        // Setup seen listener
        seenListenerRef.current = (data: { userId: string; messageIds: string[] }) => {
          if (!isMounted) return;
          
          setMessages((prev) =>
            prev.map((msg) => {
              if (data.messageIds.includes(msg._id) && !msg.seenBy.includes(data.userId)) {
                return {
                  ...msg,
                  seenBy: [...msg.seenBy, data.userId],
                };
              }
              return msg;
            })
          );
        };
        chatSocket.onMessagesSeen(seenListenerRef.current);
      } catch (err) {
        console.error('Chat: Failed to initialize chat:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
          setIsLoadingMessages(false);
        }
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (messageListenerRef.current) {
        chatSocket.offReceiveMessage(messageListenerRef.current);
      }
      if (typingListenerRef.current) {
        chatSocket.offUserTyping(typingListenerRef.current);
      }
      if (seenListenerRef.current) {
        chatSocket.offMessagesSeen(seenListenerRef.current);
      }
      chatSocket.leaveRoom(id);
    };
  }, [id, userId]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  /**
   * Handle message input change
   */
  const handleInputChange = useCallback((text: string) => {
    setMessageInput(text);

    // Send typing indicator
    if (id && userId) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      chatSocket.sendTypingIndicator(id, true).catch(console.error);

      typingTimeoutRef.current = setTimeout(() => {
        chatSocket.sendTypingIndicator(id, false).catch(console.error);
      }, 2000);
    }
  }, [id, userId]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !id || !userId || isSending) return;

    try {
      setIsSending(true);
      const messageText = messageInput.trim();

      // Clear input immediately for better UX
      setMessageInput('');
      Keyboard.dismiss();

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await chatSocket.sendTypingIndicator(id, false);

      // Send message via socket
      await chatSocket.sendMessage(id, messageText);

      setIsSending(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      // Restore input on error
      setMessageInput(messageInput);
      setIsSending(false);
    }
  }, [messageInput, id, userId, isSending]);

  /**
   * Format message timestamp
   */
  const formatMessageTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  /**
   * Render chat message
   */
  const renderChatMessage = (message: Message): React.ReactElement => {
    const isCurrentUser = message.senderId === userId;
    const senderInfo = room?.members.find((m) => m.userID === message.senderId);
    const senderName = senderInfo?.nickname || senderInfo?.username || 'Unknown';
    const senderImage = senderInfo?.profileImage;

    return (
      <ChatBubble
        key={message._id}
        message={message.message}
        isCurrentUser={isCurrentUser}
        name={!isCurrentUser ? senderName : undefined}
        profileImage={!isCurrentUser ? senderImage : undefined}
        date={formatMessageTime(message.createdAt)}
        profileLink={!isCurrentUser ? `/user/${message.senderId}` : undefined}
      />
    );
  };

  /**
   * Render typing indicator
   */
  const renderTypingIndicator = (): React.ReactElement | null => {
    const activeTypingUsers = Array.from(typingUsers.values()).filter(
      (user) => Date.now() - user.timestamp < 5000 // Remove after 5 seconds
    );

    if (activeTypingUsers.length === 0) return null;

    const typingNames = activeTypingUsers
      .map((user) => {
        const memberInfo = room?.members.find((m) => m.userID === user.userId);
        return memberInfo?.nickname || memberInfo?.username || 'Someone';
      })
      .join(', ');

    return (
      <View style={styles.typingIndicatorContainer}>
        <ThemedText style={styles.typingIndicator}>
          {typingNames} {activeTypingUsers.length === 1 ? 'is' : 'are'} typing...
        </ThemedText>
      </View>
    );
  };

  /**
   * Render list item
   */
  const renderItem: ListRenderItem<Message> = ({ item }) => renderChatMessage(item);

  /**
   * Render empty state
   */
  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <ThemedText type="subtitle">No messages yet</ThemedText>
      <ThemedText style={styles.emptyText}>Start the conversation!</ThemedText>
    </View>
  );

  // Loading state - wait for both room and messages
  if (!id || !userId || isRoomLoading || isLoadingMessages) {
    console.log('Chat: Loading state', { id, userId, isRoomLoading, isLoadingMessages });
    return (
      <ThemedView style={styles.container} color="secondary">
        <BackButton type="floating" color="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ThemedView>
    );
  }

  // Error state - only show if room actually failed to load
  if (roomError || !room) {
    console.log('Chat: Error state', { roomError, room });
    return (
      <ThemedView style={styles.container} color="secondary">
        <BackButton type="floating" color="white" />
        <View style={styles.errorContainer}>
          <ThemedText type="subtitle" style={{ color: 'red', marginBottom: 20 }}>
            {roomError ? 'Failed to load room' : 'Room not found'}
          </ThemedText>
          <ThemedText style={{ opacity: 0.6, textAlign: 'center' }}>
            {roomError?.message || 'The room you are looking for does not exist.'}
          </ThemedText>
          <TouchableOpacity 
            style={{ marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: accentColor, borderRadius: 8 }}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: 'white', textAlign: 'center' }}>
              Go Back
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <ThemedView style={styles.container} color="secondary">
        {/* Header */}
        <ChatHeader
          title={room.name || 'Chat'}
          description={`${room.members.length} members`}
          hasBackButton={true}
        />

        {/* Error message */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: primaryColor }]}>
            <ThemedText style={{ color: 'white' }}>{error}</ThemedText>
          </View>
        )}

        {/* Messages area - FlatList takes full available space */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
          scrollEventThrottle={16}
          windowSize={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        {/* Message input */}
        <ChatField
          value={messageInput}
          onChangeText={handleInputChange}
          onSend={handleSendMessage}
          placeholder="Type a message..."
          maxHeight={120}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorBanner: {
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  typingIndicatorContainer: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  typingIndicator: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.6,
  },
});