import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fname: string;
  lname?: string;
  username?: string;
  email: string;
  password?: string;
  googleId?: string;
  provider?: string;
  contactNumber?: string;
  bdate: Date;
  gender: string;
  profileImage?: string;
  type: string;
  status: string;
  createdOn: Date;
  updatedOn: Date;
  apps?: string[];
  isEmailVerified?: boolean;
  isContactNumberVerified?: boolean;
  is2FAEnabled: boolean;
}

const userSchema = new Schema<IUser>({
  fname: { type: String, required: true },
  lname: { type: String, required: false },
  username: {
    type: String,
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"]
  },
  password: { type: String, required: function() { return this.provider === 'email'; } },
  googleId: { type: String, unique: true, sparse: true },
  provider: { type: String, enum: ['email', 'google'], default: 'email' },
  contactNumber: { type: String, required: false },
  bdate: { type: Date, default: Date.now },
  gender: { type: String, default: "" },
  profileImage: { type: String, required: false },
  type: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  apps: { type: [String], default: [] },
  isEmailVerified: { type: Boolean, default: false },
  isContactNumberVerified: { type: Boolean, default: function() { return this.contactNumber ? false : undefined; } },
  is2FAEnabled: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' }});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ gender: 1 });

export default mongoose.model<IUser>('User', userSchema);

