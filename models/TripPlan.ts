import mongoose, { Document, Schema } from 'mongoose';

export interface ITripDestination {
  name: string;
  coordinates?: { latitude: number; longitude: number };
  arrivalDate?: Date;
  departureDate?: Date;
  notes?: string;
}

export interface ITripPlan extends Document {
  userId: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  destinations: ITripDestination[];
  transportModes: string[];
  accommodations: Array<{
    name: string;
    address?: string;
    checkIn?: Date;
    checkOut?: Date;
    contact?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TripPlanSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    destinations: [
      {
        name: { type: String, required: true },
        coordinates: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
        arrivalDate: { type: Date },
        departureDate: { type: Date },
        notes: { type: String },
      },
    ],
    transportModes: [{ type: String }],
    accommodations: [
      {
        name: { type: String, required: true },
        address: { type: String },
        checkIn: { type: Date },
        checkOut: { type: Date },
        contact: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const TripPlan =
  (mongoose.models.TripPlan as mongoose.Model<ITripPlan>) ||
  mongoose.model<ITripPlan>('TripPlan', TripPlanSchema);

export default TripPlan;

