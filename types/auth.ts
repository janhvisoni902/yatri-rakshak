export enum UserRole {
  TOURIST = 'tourist',
  LOCAL_CITIZEN = 'local_citizen',
  POLICE = 'police',
  TOURISM_DEPT = 'tourism_dept',
  HIGHER_AUTHORITY = 'higher_authority',
  ADMIN = 'admin',
  PUBLIC = 'public'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  
  // Tourist-specific fields
  digitalTouristId?: string;
  nationalId?: string; // Aadhaar/Passport
  nationality?: string;
  visitStartDate?: Date;
  visitEndDate?: Date;
  itinerary?: TouristItinerary;
  emergencyContacts?: EmergencyContact[];
  safetyScore?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  
  // Police/Authority fields
  badgeNumber?: string;
  department?: string;
  jurisdiction?: string;
  
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface TouristItinerary {
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
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface DigitalTouristID {
  id: string;
  touristId: string;
  blockchainHash: string;
  qrCode: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: UserRole;
  badgeNumber?: string;
  department?: string;
}
