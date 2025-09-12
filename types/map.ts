export interface StateData {
  name: string;
  code?: string;
  incidents: number;
  tourists?: number;
  police?: number;
  safetyScore: number;
  touristCount?: number;
  resolvedIncidents?: number;
  popularDestinations?: string[];
  emergencyContacts?: {
    police: string;
    medical: string;
    tourist: string;
  };
  coordinates?: { x: number; y: number };
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}
