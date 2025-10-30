'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Card, CardContent } from '@/components/card';
import {
  MapPin,
  Shield,
  Heart,
  Users,
  Globe,
  Navigation,
  AlertTriangle,
  Phone,
  Star
} from 'lucide-react';

interface SafetyZone {
  id: string;
  name: string;
  type: 'safe_house' | 'police_station' | 'hospital' | 'embassy' | 'hotel' | 'public_place';
  address: string;
  coordinates: { lat: number; lng: number };
  distance?: string | number;
  distanceFormatted?: string;
  rating: number;
  verified: boolean;
  contact?: string;
  hours?: string;
}

interface SafetyAlert {
  id: string;
  type: 'harassment' | 'stalking' | 'unsafe_area' | 'emergency' | 'suspicious_activity';
  message: string;
  location: string;
  coordinates: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
  distance?: string | number;
  distanceFormatted?: string;
  timeAgo?: string;
}

interface SafetyMapProps {
  currentLocation: { lat: number; lng: number } | null;
  safetyZones: SafetyZone[];
  safetyAlerts: SafetyAlert[];
  onZoneSelect?: (zone: SafetyZone) => void;
  onAlertSelect?: (alert: SafetyAlert) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function SafetyMap({
  currentLocation,
  safetyZones,
  safetyAlerts,
  onZoneSelect,
  onAlertSelect
}: SafetyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SafetyZone | SafetyAlert | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API Key available:', !!apiKey);
    
    if (typeof window !== 'undefined' && !window.google) {
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        setIsMapLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
      };
      document.head.appendChild(script);
    } else if (window.google) {
      console.log('Google Maps already loaded');
      setIsMapLoaded(true);
    }
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (isMapLoaded && mapRef.current && currentLocation) {
      initializeMap();
    }
  }, [isMapLoaded, currentLocation]);

  // Update markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [safetyZones, safetyAlerts]);

  const initializeMap = () => {
    if (!mapRef.current || !currentLocation || !window.google) {
      console.log('Map initialization failed:', {
        mapRef: !!mapRef.current,
        currentLocation: !!currentLocation,
        googleMaps: !!window.google
      });
      return;
    }

    console.log('Initializing map with location:', currentLocation);

    const map = new window.google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    console.log('Map initialized successfully');
    updateMapMarkers();
  };

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    // In a real implementation, you'd track markers to clear them

    // Add current location marker
    if (currentLocation) {
      new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });
    }

    // Add safety zone markers
    safetyZones.forEach(zone => {
      const marker = new window.google.maps.Marker({
        position: zone.coordinates,
        map: map,
        title: zone.name,
        icon: {
          url: getZoneIcon(zone.type),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createZoneInfoContent(zone)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedItem(zone);
        onZoneSelect?.(zone);
      });
    });

    // Add safety alert markers
    safetyAlerts.forEach(alert => {
      const marker = new window.google.maps.Marker({
        position: alert.coordinates,
        map: map,
        title: alert.message,
        icon: {
          url: getAlertIcon(alert.severity),
          scaledSize: new window.google.maps.Size(28, 28)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createAlertInfoContent(alert)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedItem(alert);
        onAlertSelect?.(alert);
      });
    });
  };

  const getZoneIcon = (type: string) => {
    const icons = {
      police_station: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M12 2L15 8H21L16 12L18 20L12 16L6 20L8 12L3 8H9L12 2Z" fill="#FFFFFF"/>
        </svg>
      `),
      hospital: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M12 6V18M6 12H18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `),
      safe_house: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M9 12L11 14L15 10" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `),
      default: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#6B7280" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
        </svg>
      `)
    };
    return icons[type as keyof typeof icons] || icons.default;
  };

  const getAlertIcon = (severity: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };
    const color = colors[severity as keyof typeof colors] || colors.medium;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M12 8V12M12 16H12.01" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  };

  const createZoneInfoContent = (zone: SafetyZone) => {
    return `
      <div style="max-width: 250px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${zone.name}</h3>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">${zone.address}</p>
        ${zone.distanceFormatted ? `<p style="margin: 0 0 4px 0; color: #3B82F6; font-size: 12px;">📍 ${zone.distanceFormatted}</p>` : ''}
        ${zone.contact ? `<p style="margin: 0 0 4px 0; color: #059669; font-size: 12px;">📞 ${zone.contact}</p>` : ''}
        ${zone.hours ? `<p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px;">🕒 ${zone.hours}</p>` : ''}
        <div style="display: flex; gap: 4px; align-items: center;">
          <span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
            ⭐ ${zone.rating}
          </span>
          ${zone.verified ? '<span style="background: #3B82F6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✓ Verified</span>' : ''}
        </div>
      </div>
    `;
  };

  const createAlertInfoContent = (alert: SafetyAlert) => {
    const severityColors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };

    return `
      <div style="max-width: 250px; padding: 8px;">
        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
          <span style="background: ${severityColors[alert.severity]}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
            ${alert.severity.toUpperCase()}
          </span>
          <span style="background: #6B7280; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
            ${alert.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937; font-size: 14px;">${alert.message}</h3>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">📍 ${alert.location}</p>
        <p style="margin: 0; color: #6B7280; font-size: 11px;">Status: ${alert.status}</p>
      </div>
    `;
  };

  const centerOnLocation = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter(currentLocation);
      mapInstanceRef.current.setZoom(16);
    }
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
          <div className="text-xs text-muted-foreground">
            <p>Current location: {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Not available'}</p>
            <p>Safety zones: {safetyZones.length}</p>
            <p>Safety alerts: {safetyAlerts.length}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border"
        style={{ minHeight: '400px' }}
      />

      {currentLocation && (
        <Button
          onClick={centerOnLocation}
          className="absolute top-4 right-4 bg-white text-gray-700 border shadow-md hover:bg-gray-50"
          size="sm"
        >
          <Navigation className="w-4 h-4 mr-1" />
          My Location
        </Button>
      )}

      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Safe Zones</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Safety Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}