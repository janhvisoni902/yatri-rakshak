import mongoose, { Document, Schema } from 'mongoose';

export type KycDocumentType =
  | 'identity_document'
  | 'address_proof'
  | 'photo'
  | 'passport'
  | 'aadhaar'
  | 'driving_license'
  | 'voter_id'
  | 'other';

export interface IKycDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: KycDocumentType;
  originalName: string;
  fileName: string;
  filePath: string; // absolute path on disk
  publicPath: string; // path served by Next static (e.g., /uploads/kyc/<userId>/<fileName>)
  size: number;
  mimeType: string;
  checksumSha256: string;
  status: 'pending' | 'verified' | 'rejected';
  issuer?: string; // optional issuing authority
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocumentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'identity_document',
        'address_proof',
        'photo',
        'passport',
        'aadhaar',
        'driving_license',
        'voter_id',
        'other'
      ],
      default: 'other',
      index: true
    },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    publicPath: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    checksumSha256: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
    issuer: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

export default (mongoose.models.KycDocument as mongoose.Model<IKycDocument>) ||
  mongoose.model<IKycDocument>('KycDocument', KycDocumentSchema);


