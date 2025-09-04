import mongoose, { Document, Schema } from 'mongoose';

export interface IGeoFence extends Document {
  name: string;
  description: string;
  type: 'restricted' | 'high_risk' | 'emergency_only' | 'tourist_zone' | 'safe_zone';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Geometric data
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  center: {
    latitude: number;
    longitude: number;
  };
  radius?: number; // For circular zones
  
  // Alert configuration
  alertSettings: {
    sendAlert: boolean;
    alertMessage: string;
    alertType: 'warning' | 'danger' | 'info';
    autoNotifyAuthorities: boolean;
    requireCheckIn: boolean;
    maxStayDuration?: number; // minutes
  };
  
  // Metadata
  createdBy: string; // User ID
  isActive: boolean;
  jurisdiction: string; // Which police station/department
  emergencyContacts: Array<{
    name: string;
    role: string;
    phone: string;
    email?: string;
  }>;
  
  // Time-based restrictions
  timeRestrictions?: {
    startTime: string; // HH:MM format
    endTime: string;
    daysOfWeek: string[]; // ['monday', 'tuesday', ...]
    seasonalRestrictions?: {
      startDate: Date;
      endDate: Date;
      reason: string;
    };
  };
  
  // Statistics
  totalAlerts: number;
  totalTouristsEntered: number;
  lastIncidentDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const GeoFenceSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Geo-fence name is required'],
    maxlength: [200, 'Name cannot exceed 200 characters'],
    index: true,
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    enum: ['restricted', 'high_risk', 'emergency_only', 'tourist_zone', 'safe_zone'],
    required: true,
    index: true,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  },
  coordinates: [{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  }],
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  radius: {
    type: Number, // in meters
    min: 0,
  },
  alertSettings: {
    sendAlert: { type: Boolean, default: true },
    alertMessage: { 
      type: String, 
      required: true,
      maxlength: [500, 'Alert message cannot exceed 500 characters']
    },
    alertType: { 
      type: String, 
      enum: ['warning', 'danger', 'info'],
      default: 'warning'
    },
    autoNotifyAuthorities: { type: Boolean, default: false },
    requireCheckIn: { type: Boolean, default: false },
    maxStayDuration: { type: Number }, // minutes
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  jurisdiction: {
    type: String,
    required: true,
    index: true,
  },
  emergencyContacts: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  }],
  timeRestrictions: {
    startTime: { type: String }, // HH:MM format
    endTime: { type: String },
    daysOfWeek: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    seasonalRestrictions: {
      startDate: { type: Date },
      endDate: { type: Date },
      reason: { type: String },
    },
  },
  totalAlerts: {
    type: Number,
    default: 0,
  },
  totalTouristsEntered: {
    type: Number,
    default: 0,
  },
  lastIncidentDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Geospatial indexes for location queries
GeoFenceSchema.index({ center: '2dsphere' });
GeoFenceSchema.index({ coordinates: '2dsphere' });

// Compound indexes for common queries
GeoFenceSchema.index({ type: 1, riskLevel: 1 });
GeoFenceSchema.index({ jurisdiction: 1, isActive: 1 });
GeoFenceSchema.index({ createdBy: 1, createdAt: -1 });

// Method to check if a point is inside the geo-fence
GeoFenceSchema.methods.containsPoint = function(latitude: number, longitude: number): boolean {
  if (this.radius && this.center) {
    // For circular zones
    const distance = this.calculateDistance(
      this.center.latitude, 
      this.center.longitude, 
      latitude, 
      longitude
    );
    return distance <= this.radius;
  } else {
    // For polygon zones - using ray casting algorithm
    return this.pointInPolygon(latitude, longitude, this.coordinates);
  }
};

// Haversine formula for distance calculation
GeoFenceSchema.methods.calculateDistance = function(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Point in polygon algorithm
GeoFenceSchema.methods.pointInPolygon = function(lat: number, lng: number, coordinates: Array<{latitude: number, longitude: number}>): boolean {
  let inside = false;
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i].latitude;
    const yi = coordinates[i].longitude;
    const xj = coordinates[j].latitude;
    const yj = coordinates[j].longitude;
    
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
};

// Method to check if current time falls within restrictions
GeoFenceSchema.methods.isTimeRestricted = function(): boolean {
  if (!this.timeRestrictions) return false;
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  const dayOfWeek = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();
  
  // Check day of week
  if (this.timeRestrictions.daysOfWeek && this.timeRestrictions.daysOfWeek.length > 0) {
    if (!this.timeRestrictions.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }
  }
  
  // Check time range
  if (this.timeRestrictions.startTime && this.timeRestrictions.endTime) {
    return currentTime >= this.timeRestrictions.startTime && 
           currentTime <= this.timeRestrictions.endTime;
  }
  
  return false;
};

export default mongoose.models.GeoFence || mongoose.model<IGeoFence>('GeoFence', GeoFenceSchema);
