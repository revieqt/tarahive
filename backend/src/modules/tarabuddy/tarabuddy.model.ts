import { Schema, model, Document } from "mongoose";

export interface ITaraBuddyLike extends Document {
  likedBy: string;
  liked: string;
  isMatch: boolean;
  createdOn: Date;
}

const TaraBuddyLikeSchema = new Schema<ITaraBuddyLike>({
  likedBy: {
    type: String,
    required: true,
    trim: true,
  },
  liked: {
    type: String,
    required: true,
    trim: true,
  },
  isMatch: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

// Add indexes for quick lookups
TaraBuddyLikeSchema.index({ likedBy: 1, liked: 1 }, { unique: true });
TaraBuddyLikeSchema.index({ likedBy: 1 });
TaraBuddyLikeSchema.index({ liked: 1 });
TaraBuddyLikeSchema.index({ isMatch: 1 });

export const TaraBuddyLikeModel = model<ITaraBuddyLike>(
  "TaraBuddyLike",
  TaraBuddyLikeSchema
);
