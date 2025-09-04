import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types/auth';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  badgeNumber?: string;
  department?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.PUBLIC,
  },
  badgeNumber: {
    type: String,
    sparse: true, // Allows multiple null values
  },
  department: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: function(this: any) {
      return this.role === UserRole.PUBLIC ? 'verified' : 'pending';
    },
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
