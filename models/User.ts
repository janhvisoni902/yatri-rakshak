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
  kycData?: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    phoneNumber: string;
    address: string;
    idType: 'passport' | 'aadhaar' | 'driving_license' | 'voter_id';
    idNumber: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    policeInfo?: {
      badgeNumber: string;
      department: string;
      jurisdiction?: string;
      serviceYears?: string;
    };
    travelInfo?: {
      visitPurpose?: string;
      visitDuration?: string;
      accommodationDetails?: string;
      emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
      };
    };
  };
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
    select: false, // Don't include password in queries by default
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
    default: 'verified', // Auto-verify all users by default
  },
  kycData: {
    fullName: String,
    dateOfBirth: String,
    nationality: String,
    phoneNumber: String,
    address: String,
    idType: {
      type: String,
      enum: ['passport', 'aadhaar', 'driving_license', 'voter_id']
    },
    idNumber: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date,
    policeInfo: {
      badgeNumber: String,
      department: String,
      jurisdiction: String,
      serviceYears: String
    },
    travelInfo: {
      visitPurpose: String,
      visitDuration: String,
      accommodationDetails: String,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String
      }
    }
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
