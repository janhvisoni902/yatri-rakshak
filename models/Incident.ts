import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  status: 'reported' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  reportedBy: string; // User ID
  assignedTo?: string; // Police officer ID
  images?: string[]; // Array of image URLs
  evidenceFiles?: string[]; // Array of evidence file URLs
  updates: Array<{
    message: string;
    updatedBy: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide an incident title'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide an incident description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  location: {
    type: String,
    required: [true, 'Please provide incident location'],
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'resolved'],
    default: 'reported',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  images: [{
    type: String,
  }],
  evidenceFiles: [{
    type: String,
  }],
  updates: [{
    message: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ priority: 1 });
IncidentSchema.index({ reportedBy: 1 });
IncidentSchema.index({ assignedTo: 1 });
IncidentSchema.index({ createdAt: -1 });
IncidentSchema.index({ location: 'text' });

export default mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
