'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function MapTest() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    testGoogleMapsIntegration();
  }, []);

  const testGoogleMapsIntegration = async () => {
    try {
      // Check API key
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not found in environment variables');
      }

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setLocation(userLocation);
            loadGoogleMaps(userLocation);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Use Delhi as default location
            const defaultLocation = { lat: 28.6139, lng: 77.2090 };
            setLocation(defaultLocation);
            loadGoogleMaps(defaultLocation);
          }
        );
      } else {
        // Use Delhi as default location
        const defaultLocation = { lat: 28.6139, lng: 77.2090 };
        setLocation(defaultLocation);
        loadGoogleMaps(defaultLocation);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const loadGoogleMaps = (userLocation: { lat: number; lng: number }) => {
    if (window.google) {
      initializeMap(userLocation);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeMap(userLocation);
    };
    
    script.onerror = () => {
      setStatus('error');
      setErrorMessage('Failed to load Google Maps script. Please check your API key and internet connection.');
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = (userLocation: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google) {
      setStatus('error');
      setErrorMessage('Map container or Google Maps not available');
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      // Add a marker for user location
      new window.google.maps.Marker({
        position: userLocation,
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

      // Add some sample safety zone markers
      const safetyZones = [
        { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01, name: 'Police Station', type: 'police' },
        { lat: userLocation.lat - 0.01, lng: userLocation.lng + 0.01, name: 'Hospital', type: 'hospital' },
        { lat: userLocation.lat + 0.01, lng: userLocation.lng - 0.01, name: 'Safe House', type: 'safe_house' }
      ];

      safetyZones.forEach(zone => {
        const color = zone.type === 'police' ? '#3B82F6' : zone.type === 'hospital' ? '#EF4444' : '#10B981';
        
        new window.google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: map,
          title: zone.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
      });

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize map');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Loading Google Maps...';
      case 'success':
        return 'Google Maps loaded successfully!';
      case 'error':
        return `Error: ${errorMessage}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Google Maps Integration Test</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {getStatusMessage()}
          </span>
        </div>

        {location && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">Location:</span>
            <span className="text-sm text-blue-600">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium">API Key:</span>
          <span className="text-sm text-green-600">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Configured ✓' : 'Missing ✗'}
          </span>
        </div>

        {status === 'success' && (
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg border border-gray-200"
          />
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2">Troubleshooting Steps:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Check if the API key is valid and not expired</li>
              <li>• Ensure Maps JavaScript API is enabled in Google Cloud Console</li>
              <li>• Verify domain restrictions allow localhost:3000</li>
              <li>• Check browser console for additional error details</li>
            </ul>
          </div>
        )}

        <Button 
          onClick={testGoogleMapsIntegration}
          className="w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Testing...' : 'Test Again'}
        </Button>
      </CardContent>
    </Card>
  );
}