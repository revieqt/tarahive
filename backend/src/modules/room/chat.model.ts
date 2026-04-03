import { Schema, model, Document } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  message: string;
  createdAt: Date;
  seenBy: string[];
}

/**
 * MongoDB Chat Message Schema
 * Enhanced MongoDB schema for additional metadata
 * Messages are primarily stored in Firebase but duplicated here for search/analytics
 */
const ChatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderImage: {
      type: String,
      optional: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    seenBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for efficient room message queries
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessageModel = model<IChatMessage>(
  'ChatMessage',
  ChatMessageSchema
);

export interface ChatMessageDTO {
  _id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  message: string;
  createdAt: string;
  seenBy: string[];
}
