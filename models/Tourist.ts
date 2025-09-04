import mongoose, { Document, Schema } from 'mongoose';

export interface ITourist extends Document {
  digitalTouristId: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string; // Aadhaar/Passport
  nationality: string;
  visitStartDate: Date;
  visitEndDate: Date;
  
  // Safety and tracking
  safetyScore: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
  };
  lastActiveAt: Date;
  isTracking: boolean; // Opt-in tracking
  
  // Itinerary
  itinerary: {
    destinations: Array<{
      name: string;
      coordinates: { latitude: number; longitude: number };
      plannedArrival: Date;
      plannedDeparture: Date;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
    accommodations: Array<{
      name: string;
      address: string;
      checkIn: Date;
      checkOut: Date;
      contact: string;
    }>;
    transportModes: string[];
  };
  
  // Emergency contacts
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>;
  
  // Blockchain and security
  blockchainHash: string;
  qrCode: string;
  encryptedData: string;
  
  // Status and alerts
  status: 'active' | 'missing' | 'in_distress' | 'safe' | 'departed';
  alerts: Array<{
    type: 'geo_fence' | 'anomaly' | 'panic' | 'inactive' | 'route_deviation';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
  }>;
  
  // Compliance and verification
  kycStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verificationDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const TouristSchema: Schema = new Schema({
  digitalTouristId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  nationalId: {
    type: String,
    required: [true, 'National ID (Aadhaar/Passport) is required'],
    unique: true,
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
  },
  visitStartDate: {
    type: Date,
    required: [true, 'Visit start date is required'],
  },
  visitEndDate: {
    type: Date,
    required: [true, 'Visit end date is required'],
  },
  safetyScore: {
    type: Number,
    default: 75,
    min: 0,
    max: 100,
  },
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    accuracy: { type: Number },
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  isTracking: {
    type: Boolean,
    default: false,
  },
  itinerary: {
    destinations: [{
      name: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      plannedArrival: { type: Date, required: true },
      plannedDeparture: { type: Date, required: true },
      riskLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
    }],
    accommodations: [{
      name: { type: String, required: true },
      address: { type: String, required: true },
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
      contact: { type: String, required: true },
    }],
    transportModes: [{ type: String }],
  },
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    isPrimary: { type: Boolean, default: false },
  }],
  blockchainHash: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  encryptedData: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'missing', 'in_distress', 'safe', 'departed'],
    default: 'active',
  },
  alerts: [{
    type: { 
      type: String, 
      enum: ['geo_fence', 'anomaly', 'panic', 'inactive', 'route_deviation'],
      required: true 
    },
    message: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    timestamp: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: String },
  }],
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for performance
TouristSchema.index({ digitalTouristId: 1 });
TouristSchema.index({ nationalId: 1 });
TouristSchema.index({ status: 1 });
TouristSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });
TouristSchema.index({ visitStartDate: 1, visitEndDate: 1 });
TouristSchema.index({ lastActiveAt: -1 });
TouristSchema.index({ safetyScore: -1 });

// Virtual for active duration
TouristSchema.virtual('activeDuration').get(function(this: ITourist) {
  const last = this.lastActiveAt instanceof Date ? this.lastActiveAt : new Date(this.lastActiveAt)
  return Math.abs(Date.now() - last.getTime());
});

// Method to check if visit is expired
TouristSchema.methods.isVisitExpired = function(this: ITourist) {
  const end = this.visitEndDate instanceof Date ? this.visitEndDate : new Date(this.visitEndDate)
  return new Date() > end;
};

// Method to calculate time since last activity
TouristSchema.methods.getInactivityDuration = function(this: ITourist) {
  const last = this.lastActiveAt instanceof Date ? this.lastActiveAt : new Date(this.lastActiveAt)
  return Math.abs(Date.now() - last.getTime());
};

export default mongoose.models.Tourist || mongoose.model<ITourist>('Tourist', TouristSchema);
