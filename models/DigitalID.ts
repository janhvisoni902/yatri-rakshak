import mongoose, { Document, Schema } from 'mongoose';

export interface IDigitalID extends Document {
  userId: mongoose.Types.ObjectId;
  idType: 'aadhaar' | 'passport';
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  blockchainHash?: string;
  encryptedData: string; // Encrypted sensitive information
  metadata: {
    createdAt: Date;
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    lastUpdated: Date;
    ipAddress?: string;
    userAgent?: string;
  };
  securityFeatures: {
    isEncrypted: boolean;
    encryptionAlgorithm: string;
    hashedIdNumber: string; // SHA-256 hash of ID number for verification
    digitalSignature?: string;
  };
  auditTrail: Array<{
    action: string;
    timestamp: Date;
    performedBy?: mongoose.Types.ObjectId;
    ipAddress?: string;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DigitalIDSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  idType: {
    type: String,
    enum: ['aadhaar', 'passport'],
    required: [true, 'ID type is required']
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  dateOfBirth: {
    type: String,
    required: [true, 'Date of birth is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    maxlength: [50, 'Nationality cannot be more than 50 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },
  verificationLevel: {
    type: String,
    enum: ['basic', 'enhanced', 'premium'],
    default: 'basic'
  },
  blockchainHash: {
    type: String,
    sparse: true // Allows multiple null values
  },
  encryptedData: {
    type: String,
    required: [true, 'Encrypted data is required']
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  },
  securityFeatures: {
    isEncrypted: {
      type: Boolean,
      default: true
    },
    encryptionAlgorithm: {
      type: String,
      default: 'AES-256-GCM'
    },
    hashedIdNumber: {
      type: String,
      required: [true, 'Hashed ID number is required'],
      index: true
    },
    digitalSignature: String
  },
  auditTrail: [{
    action: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    details: String
  }]
}, {
  timestamps: true
});

// Indexes for performance and security
DigitalIDSchema.index({ userId: 1, status: 1 });
DigitalIDSchema.index({ hashedIdNumber: 1 });
DigitalIDSchema.index({ 'metadata.createdAt': -1 });
DigitalIDSchema.index({ idType: 1, status: 1 });

// Pre-save middleware to update metadata
DigitalIDSchema.pre('save', function(next) {
  (this as any).metadata.lastUpdated = new Date();
  next();
});

// Static method to find by hashed ID number
DigitalIDSchema.statics.findByHashedId = function(hashedIdNumber: string) {
  return this.findOne({ 'securityFeatures.hashedIdNumber': hashedIdNumber });
};

// Instance method to add audit trail entry
DigitalIDSchema.methods.addAuditEntry = function(action: string, performedBy?: string, ipAddress?: string, details?: string) {
  this.auditTrail.push({
    action,
    timestamp: new Date(),
    performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
    ipAddress,
    details
  });
};

export default mongoose.models.DigitalID || mongoose.model<IDigitalID>('DigitalID', DigitalIDSchema);
