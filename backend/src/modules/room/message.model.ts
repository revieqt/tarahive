import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  seenBy: string[];
}

const MessageSchema = new Schema<IMessage>({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  seenBy: {
    type: [String],
    default: [],
  },
});

export const MessageModel = model<IMessage>('Message', MessageSchema);