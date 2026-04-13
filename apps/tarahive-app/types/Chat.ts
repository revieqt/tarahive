/**
 * Chat System - Type Definitions
 * Centralized types for type safety and better IDE support
 */

// ===========================
// MESSAGE TYPES
// ===========================

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  seenBy: string[];
  isSystemMessage?: boolean;
}

export interface MessageGroup {
  senderId: string;
  messages: Message[];
}

// ===========================
// SOCKET EVENT TYPES
// ===========================

export interface SocketJoinRoomData {
  roomId: string;
}

export interface SocketSendMessageData {
  roomId: string;
  message: string;
}

export interface SocketTypingData {
  roomId: string;
  isTyping: boolean;
}

export interface SocketMarkSeenData {
  roomId: string;
  messageIds: string[];
}

export interface SocketLeaveRoomData {
  roomId: string;
}

export interface SocketReceiveMessageData {
  _id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  seenBy: string[];
  isSystemMessage?: boolean;
}

export interface SocketUserTypingData {
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface SocketMessageSeenData {
  userId: string;
  messageIds: string[];
  timestamp: string;
}

export interface SocketUserJoinedData {
  userId: string;
  timestamp: string;
}

export interface SocketUserLeftData {
  userId: string;
  timestamp: string;
}

// ===========================
// ROOM TYPES
// ===========================

export interface RoomMember {
  userID: string;
  nickname?: string;
  username?: string;
  profileImage?: string;
  joinedOn: string;
  status: 'member' | 'invited' | 'waiting';
}

export interface Room {
  _id: string;
  name: string;
  inviteCode: string;
  roomImage?: string;
  roomColor: string;
  itineraryID?: string;
  itineraryTitle?: string;
  itineraryStartDate?: string;
  itineraryEndDate?: string;
  chatID: string;
  admins: string[];
  members: RoomMember[];
}

// ===========================
// CHAT STATE TYPES
// ===========================

export interface ChatScreenState {
  messages: Message[];
  messageInput: string;
  isLoadingMessages: boolean;
  isSending: boolean;
  typingUsers: Map<string, TypingUserInfo>;
  error: string | null;
}

export interface TypingUserInfo {
  userId: string;
  timestamp: number;
}

// ===========================
// COMPONENT PROPS TYPES
// ===========================

export interface ChatBubbleProps {
  message: string;
  isCurrentUser: boolean;
  name?: string;
  profileImage?: string | number;
  date?: string;
  profileLink?: string;
}

export interface ChatHeaderProps {
  title: string;
  description?: string;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  optionsValue?: React.ReactNode[];
}

export interface ChatFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend?: () => void;
  placeholder?: string;
  maxHeight?: number;
  children?: React.ReactNode;
}

export interface ChatAreaProps {
  children: React.ReactNode;
}

// ===========================
// SOCKET CLIENT TYPES
// ===========================

export interface SocketClientConfig {
  url: string;
  token: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
  transports?: Array<'websocket' | 'polling'>;
}

export interface SocketCallback<T = any> {
  (success: boolean, data?: T | string): void;
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface GetMessagesResponse {
  data: Message[];
  cursor?: string;
  hasMore?: boolean;
}

export interface SendMessageResponse {
  messageId: string;
  timestamp: string;
}

export interface MarkMessagesSeenResponse {
  markedCount: number;
  timestamp: string;
}

// ===========================
// ERROR TYPES
// ===========================

export interface ChatError extends Error {
  code?: string;
  details?: Record<string, any>;
}

export class ChatConnectionError extends Error implements ChatError {
  code = 'CONNECTION_ERROR';
  details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.details = details;
  }
}

export class ChatAuthError extends Error implements ChatError {
  code = 'AUTH_ERROR';
  details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.details = details;
  }
}

export class ChatRoomError extends Error implements ChatError {
  code = 'ROOM_ERROR';
  details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.details = details;
  }
}

// ===========================
// UTILITY TYPES
// ===========================

export type MessageFilter = {
  roomId?: string;
  senderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
};

export type TypingIndicatorState = 'typing' | 'idle' | 'stopped';

export type ChatViewMode = 'messages' | 'loading' | 'empty' | 'error';

// ===========================
// HELPER TYPE GUARDS
// ===========================

export const isMessage = (obj: any): obj is Message => {
  return (
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.roomId === 'string' &&
    typeof obj.senderId === 'string' &&
    typeof obj.message === 'string'
  );
};

export const isRoom = (obj: any): obj is Room => {
  return (
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.members)
  );
};

export const isTypingData = (obj: any): obj is SocketUserTypingData => {
  return (
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.isTyping === 'boolean'
  );
};
