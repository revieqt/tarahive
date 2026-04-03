import mongoose, { Schema, Document } from 'mongoose';

export interface ITaraGUser extends Document {
  userID: string;
  likes?: string[];
  bio: string;
  isFirstLogin: boolean;
  isProUser: boolean;
  expPoints: number;
  createdOn: Date;
  updatedOn: Date;
  safetyState: {
    isInAnEmergency: boolean;
    emergencyType: string;
    emergencyContact?: string;
  };
  visibilitySettings: {
    isProfilePublic: boolean;
    isPersonalInfoPublic: boolean;
    isTravelInfoPublic: boolean;
  };
  taraBuddySettings: {
    isTaraBuddyEnabled: boolean;
    preferredGender?: string;
    preferredDistance?: number;
    preferredAgeRange?: number[];
    preferredZodiac?: string[];
  };
}

const taragUserSchema = new Schema<ITaraGUser>({
  userID: { type: String, required: true },
  likes: { type: [String], default: [] },
  bio: { type: String, default: "" },
  isFirstLogin: { type: Boolean, default: true },
  isProUser: { type: Boolean, default: false },
  expPoints: { type: Number, default: 0 },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  safetyState: {
    isInAnEmergency: { type: Boolean, default: false },
    emergencyType: { type: String, default: "" },
    emergencyContact: { type: String, default: "" }
  },
  visibilitySettings: {
    isProfilePublic: { type: Boolean, default: true },
    isPersonalInfoPublic: { type: Boolean, default: true },
    isTravelInfoPublic: { type: Boolean, default: true },
  },
  taraBuddySettings: {
    type: {
      isTaraBuddyEnabled: { type: Boolean, default: false },
      preferredGender: String,
      preferredDistance: Number,
      preferredAgeRange: [Number],
      preferredZodiac: [String],
    },
    required: false,
    default: undefined
  }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' }});

export default mongoose.model<ITaraGUser>('TaraGUser', taragUserSchema);

