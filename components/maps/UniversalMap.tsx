'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Input } from '@/components/input';
import {
    MapPin,
    Shield,
    Eye,
    EyeOff,
    Users,
    Navigation,
    AlertTriangle,
    Phone,
    Star,
    Lock,
    Unlock,
    Settings,
    RefreshCw,
    Target,
    Activity,
    Search
} from 'lucide-react';

interface LocationData {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
}

interface UserLocation {
    userId: string;
    userName: string;
    userRole: string;
    location: LocationData;
    isTracking: boolean;
    privacyLevel: 'public' | 'authorities_only' | 'emergency_only' | 'private';
    lastSeen: string;
    safetyStatus: 'safe' | 'warning' | 'emergency';
}

interface SafetyZone {
    id: string;
    name: string;
    type: 'police_station' | 'hospital' | 'safe_house' | 'embassy' | 'hotel' | 'public_place';
    coordinates: { lat: number; lng: number };
    address: string;
    contact?: string;
    verified: boolean;
    distance?: number;
    distanceFormatted?: string;
}

interface UniversalMapProps {
    showUserTracking?: boolean;
    allowLocationSharing?: boolean;
    emergencyMode?: boolean;
    className?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

export default function UniversalMap({
    showUserTracking = false,
    allowLocationSharing = true,
    emergencyMode = false,
    className = ""
}: UniversalMapProps) {
    const { data: session } = useSession();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [privacyLevel, setPrivacyLevel] = useState<'public' | 'authorities_only' | 'emergency_only' | 'private'>('authorities_only');
    const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);
    const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
    const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [riskZones, setRiskZones] = useState<any[]>([]);
    const [currentRiskLevel, setCurrentRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
    const [riskAlert, setRiskAlert] = useState<string | null>(null);
    const [gpsSignalQuality, setGpsSignalQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
    const [locationConfidence, setLocationConfidence] = useState<number>(0);
    const [isCalibrating, setIsCalibrating] = useState(false);

    // Check user permissions for tracking
    const canTrackUsers = session?.user?.role && ['police', 'higher_authority', 'admin'].includes(session.user.role);
    const canViewAllUsers = session?.user?.role && ['higher_authority', 'admin'].includes(session.user.role);

    // Load Google Maps
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (typeof window !== 'undefined' && !window.google && apiKey) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsMapLoaded(true);
            script.onerror = () => console.error('Failed to load Google Maps');
            document.head.appendChild(script);
        } else if (window.google) {
            setIsMapLoaded(true);
        }
    }, []);

    // Initialize map
    useEffect(() => {
        if (isMapLoaded && mapRef.current && currentLocation) {
            initializeMap();
        }
    }, [isMapLoaded, currentLocation]);

    // Get initial location and request notification permission
    useEffect(() => {
        getCurrentLocation();

        // Request notification permission for risk alerts
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Fetch nearby data when location changes
    useEffect(() => {
        if (currentLocation) {
            fetchNearbySafetyZones();
            fetchRiskZones();
            checkCurrentLocationRisk();
            if (canTrackUsers) {
                fetchNearbyUsers();
            }
        }
    }, [currentLocation, canTrackUsers]);

    // Monitor location for risk zone alerts
    useEffect(() => {
        if (currentLocation && riskZones.length > 0) {
            checkCurrentLocationRisk();
        }
    }, [currentLocation, riskZones]);

    const getCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        try {
            // Use high-precision location with multiple attempts
            const location = await getHighPrecisionLocation();
            setCurrentLocation(location);
            setIsLocationPermissionGranted(true);

            // Send location to server if tracking is enabled
            if (isTracking && allowLocationSharing) {
                updateLocationOnServer(location);
            }
        } catch (error) {
            console.error('High precision geolocation failed, trying standard method:', error);
            
            // Fallback to standard geolocation
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: LocationData = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date().toISOString(),
                        accuracy: position.coords.accuracy
                    };
                    setCurrentLocation(location);
                    setIsLocationPermissionGranted(true);

                    if (isTracking && allowLocationSharing) {
                        updateLocationOnServer(location);
                    }
                },
                (fallbackError) => {
                    console.error('Fallback geolocation error:', fallbackError);
                    setIsLocationPermissionGranted(false);
                    // Use default location (Delhi) with low accuracy indicator
                    setCurrentLocation({
                        lat: 28.6139,
                        lng: 77.2090,
                        timestamp: new Date().toISOString(),
                        accuracy: 10000 // Very low accuracy indicator
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 30000
                }
            );
        }
    }, [isTracking, allowLocationSharing]);

    // High-precision location function with multiple positioning methods
    const getHighPrecisionLocation = useCallback((): Promise<LocationData> => {
        return new Promise((resolve, reject) => {
            const locations: LocationData[] = [];
            let completedAttempts = 0;
            const maxAttempts = 3;
            const timeoutDuration = 20000;

            const processResults = () => {
                if (locations.length === 0) {
                    reject(new Error('No location data obtained'));
                    return;
                }

                // Filter out locations with poor accuracy (>100m)
                const accurateLocations = locations.filter(loc => 
                    loc.accuracy && loc.accuracy <= 100
                );

                let bestLocation: LocationData;

                if (accurateLocations.length > 0) {
                    // Use the most accurate location
                    bestLocation = accurateLocations.reduce((prev, current) => 
                        (current.accuracy && prev.accuracy && current.accuracy < prev.accuracy) ? current : prev
                    );
                } else if (locations.length >= 2) {
                    // Calculate average of multiple readings for better accuracy
                    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
                    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
                    const bestAccuracy = Math.min(...locations.map(loc => loc.accuracy || 1000));
                    
                    bestLocation = {
                        lat: avgLat,
                        lng: avgLng,
                        timestamp: new Date().toISOString(),
                        accuracy: bestAccuracy * 0.7 // Averaging improves accuracy
                    };
                } else {
                    // Use the single location we have
                    bestLocation = locations[0];
                }

                resolve(bestLocation);
            };

            const attemptLocation = (attemptNumber: number) => {
                const options: PositionOptions = {
                    enableHighAccuracy: true,
                    timeout: attemptNumber === 1 ? 8000 : 5000, // Longer timeout for first attempt
                    maximumAge: attemptNumber === 1 ? 0 : 10000 // Fresh location for first attempt
                };

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location: LocationData = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            timestamp: new Date().toISOString(),
                            accuracy: position.coords.accuracy
                        };

                        locations.push(location);
                        completedAttempts++;

                        // If we get a very accurate reading (< 10m), use it immediately
                        if (position.coords.accuracy <= 10) {
                            resolve(location);
                            return;
                        }

                        // If we have enough attempts or good accuracy, process results
                        if (completedAttempts >= maxAttempts || position.coords.accuracy <= 20) {
                            processResults();
                        } else {
                            // Try again for better accuracy
                            setTimeout(() => attemptLocation(attemptNumber + 1), 1000);
                        }
                    },
                    (error) => {
                        console.warn(`Location attempt ${attemptNumber} failed:`, error);
                        completedAttempts++;
                        
                        if (completedAttempts >= maxAttempts) {
                            if (locations.length > 0) {
                                processResults();
                            } else {
                                reject(error);
                            }
                        } else {
                            // Try again with different settings
                            setTimeout(() => attemptLocation(attemptNumber + 1), 1000);
                        }
                    },
                    options
                );
            };

            // Start first attempt
            attemptLocation(1);

            // Overall timeout
            setTimeout(() => {
                if (locations.length > 0) {
                    processResults();
                } else {
                    reject(new Error('Location timeout'));
                }
            }, timeoutDuration);
        });
    }, []);

    const startLocationTracking = useCallback(() => {
        if (!navigator.geolocation || !allowLocationSharing) return;

        setIsTracking(true);

        // Enhanced tracking with accuracy filtering and smoothing
        let lastAccurateLocation: LocationData | null = null;
        let locationBuffer: LocationData[] = [];
        const bufferSize = 5;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation: LocationData = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString(),
                    accuracy: position.coords.accuracy
                };

                // Apply accuracy filtering and smoothing
                const processedLocation = processLocationUpdate(newLocation, lastAccurateLocation, locationBuffer);
                
                if (processedLocation) {
                    setCurrentLocation(processedLocation);
                    assessLocationQuality(processedLocation);
                    updateLocationOnServer(processedLocation);
                    lastAccurateLocation = processedLocation;
                    
                    // Update buffer
                    locationBuffer.push(processedLocation);
                    if (locationBuffer.length > bufferSize) {
                        locationBuffer.shift();
                    }
                }
            },
            (error) => {
                console.error('Location tracking error:', error);
                // Try to restart tracking with different settings
                if (error.code === error.TIMEOUT) {
                    console.log('Restarting location tracking due to timeout...');
                    setTimeout(() => {
                        if (isTracking) {
                            stopLocationTracking();
                            startLocationTracking();
                        }
                    }, 2000);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // More frequent updates for better accuracy
            }
        );
    }, [allowLocationSharing, isTracking]);

    // Process location updates with accuracy filtering and smoothing
    const processLocationUpdate = useCallback((
        newLocation: LocationData, 
        lastLocation: LocationData | null, 
        buffer: LocationData[]
    ): LocationData | null => {
        
        // Reject locations with very poor accuracy (>200m)
        if (newLocation.accuracy && newLocation.accuracy > 200) {
            console.warn('Rejecting location with poor accuracy:', newLocation.accuracy);
            return null;
        }

        // If this is the first location or significantly more accurate, use it
        if (!lastLocation || 
            (newLocation.accuracy && lastLocation.accuracy && newLocation.accuracy < lastLocation.accuracy * 0.7)) {
            return newLocation;
        }

        // Check for unrealistic movement (speed > 200 km/h)
        if (lastLocation) {
            const distance = calculateDistance(
                lastLocation.lat, lastLocation.lng,
                newLocation.lat, newLocation.lng
            );
            const timeDiff = (new Date(newLocation.timestamp).getTime() - new Date(lastLocation.timestamp).getTime()) / 1000; // seconds
            const speed = (distance * 1000) / timeDiff; // m/s
            const speedKmh = speed * 3.6; // km/h

            if (speedKmh > 200) {
                console.warn('Rejecting location due to unrealistic speed:', speedKmh, 'km/h');
                return null;
            }
        }

        // Apply smoothing if we have enough data points
        if (buffer.length >= 3) {
            const smoothedLocation = applySmoothingFilter(newLocation, buffer);
            return smoothedLocation;
        }

        return newLocation;
    }, []);

    // Apply Kalman-like smoothing filter for better accuracy
    const applySmoothingFilter = useCallback((
        newLocation: LocationData, 
        buffer: LocationData[]
    ): LocationData => {
        
        // Calculate weighted average based on accuracy
        let totalWeight = 0;
        let weightedLat = 0;
        let weightedLng = 0;

        // Include recent locations in smoothing
        const recentLocations = [...buffer.slice(-3), newLocation];
        
        recentLocations.forEach((loc, index) => {
            // More weight to recent and accurate locations
            const timeWeight = Math.pow(0.8, recentLocations.length - index - 1); // Exponential decay
            const accuracyWeight = loc.accuracy ? 1 / Math.max(loc.accuracy, 1) : 1;
            const weight = timeWeight * accuracyWeight;
            
            totalWeight += weight;
            weightedLat += loc.lat * weight;
            weightedLng += loc.lng * weight;
        });

        const smoothedLat = weightedLat / totalWeight;
        const smoothedLng = weightedLng / totalWeight;

        // Calculate improved accuracy estimate
        const accuracySum = recentLocations.reduce((sum, loc) => sum + (loc.accuracy || 50), 0);
        const avgAccuracy = accuracySum / recentLocations.length;
        const improvedAccuracy = avgAccuracy * 0.6; // Smoothing improves accuracy

        return {
            lat: smoothedLat,
            lng: smoothedLng,
            timestamp: newLocation.timestamp,
            accuracy: Math.max(improvedAccuracy, 1) // Minimum 1m accuracy
        };
    }, []);

    const stopLocationTracking = useCallback(() => {
        setIsTracking(false);

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        // Notify server to stop tracking
        updateTrackingStatus(false);
    }, []);

    const updateLocationOnServer = async (location: LocationData) => {
        if (!session) return;

        try {
            await fetch('/api/location/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    privacyLevel,
                    isTracking: true,
                    emergencyMode
                })
            });
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    };

    const updateTrackingStatus = async (tracking: boolean) => {
        if (!session) return;

        try {
            await fetch('/api/location/tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isTracking: tracking,
                    privacyLevel
                })
            });
        } catch (error) {
            console.error('Failed to update tracking status:', error);
        }
    };

    const fetchNearbySafetyZones = async () => {
        if (!currentLocation) return;

        try {
            const response = await fetch(
                `/api/safety-zones?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=5`
            );
            const data = await response.json();
            if (data.success) {
                setSafetyZones(data.zones);
            }
        } catch (error) {
            console.error('Failed to fetch safety zones:', error);
        }
    };

    const fetchNearbyUsers = async () => {
        if (!currentLocation || !canTrackUsers) return;

        try {
            const response = await fetch(
                `/api/location/nearby-users?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=10`
            );
            const data = await response.json();
            if (data.success) {
                setNearbyUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch nearby users:', error);
        }
    };

    // Search for locations using Google Places API
    const searchLocation = async (query: string) => {
        if (!query.trim() || !window.google) return;

        setIsSearching(true);
        try {
            const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
            const request = {
                query: query,
                fields: ['name', 'geometry', 'formatted_address', 'place_id', 'rating'],
            };

            service.textSearch(request, (results: any[], status: any) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setSearchResults(results.slice(0, 5)); // Limit to 5 results
                } else {
                    setSearchResults([]);
                }
                setIsSearching(false);
            });
        } catch (error) {
            console.error('Search error:', error);
            setIsSearching(false);
        }
    };

    // Navigate to selected location
    const navigateToLocation = (location: { lat: number; lng: number }, name: string) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(16);

            // Add marker for searched location
            new window.google.maps.Marker({
                position: location,
                map: mapInstanceRef.current,
                title: name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="2"/>
                            <circle cx="12" cy="10" r="3" fill="#FFFFFF"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32)
                }
            });
        }
        setSearchResults([]);
        setSearchQuery('');
    };

    // Fetch risk zones data
    const fetchRiskZones = async () => {
        if (!currentLocation) return;

        try {
            const response = await fetch(
                `/api/risk-zones?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=5`
            );
            const data = await response.json();
            if (data.success) {
                setRiskZones(data.zones);
            }
        } catch (error) {
            console.error('Failed to fetch risk zones:', error);
            // Mock risk zones for demonstration
            const mockRiskZones = [
                {
                    id: 'risk-1',
                    name: 'High Crime Area - Old Delhi',
                    center: { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 },
                    radius: 500, // meters
                    riskLevel: 'high',
                    reasons: ['High theft incidents', 'Poor lighting', 'Isolated area'],
                    recommendations: ['Avoid after 8 PM', 'Travel in groups', 'Use main roads only']
                },
                {
                    id: 'risk-2',
                    name: 'Moderate Risk Zone - Market Area',
                    center: { lat: currentLocation.lat - 0.005, lng: currentLocation.lng + 0.008 },
                    radius: 300,
                    riskLevel: 'medium',
                    reasons: ['Pickpocket incidents', 'Crowded area'],
                    recommendations: ['Keep valuables secure', 'Stay alert', 'Avoid displaying expensive items']
                }
            ];
            setRiskZones(mockRiskZones);
        }
    };

    // Check if current location is in a risk zone
    const checkCurrentLocationRisk = () => {
        if (!currentLocation || riskZones.length === 0) return;

        for (const zone of riskZones) {
            const distance = calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                zone.center.lat,
                zone.center.lng
            );

            // Convert radius from meters to kilometers
            const radiusKm = zone.radius / 1000;

            if (distance <= radiusKm) {
                setCurrentRiskLevel(zone.riskLevel);
                setRiskAlert(`⚠️ You are in a ${zone.riskLevel} risk area: ${zone.name}`);

                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification('Safety Alert', {
                        body: `You've entered ${zone.name}. ${zone.recommendations[0]}`,
                        icon: '/favicon.ico'
                    });
                }

                // Vibrate device if supported
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }

                return;
            }
        }

        // If not in any risk zone, reset alert
        if (riskAlert) {
            setCurrentRiskLevel('low');
            setRiskAlert(null);
        }
    };

    // Calculate distance between two coordinates
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Assess GPS signal quality and location confidence
    const assessLocationQuality = useCallback((location: LocationData) => {
        if (!location.accuracy) {
            setGpsSignalQuality('poor');
            setLocationConfidence(20);
            return;
        }

        let quality: 'excellent' | 'good' | 'fair' | 'poor';
        let confidence: number;

        if (location.accuracy <= 5) {
            quality = 'excellent';
            confidence = 95;
        } else if (location.accuracy <= 15) {
            quality = 'good';
            confidence = 85;
        } else if (location.accuracy <= 50) {
            quality = 'fair';
            confidence = 70;
        } else {
            quality = 'poor';
            confidence = Math.max(20, 100 - location.accuracy);
        }

        setGpsSignalQuality(quality);
        setLocationConfidence(confidence);
    }, []);

    // Enhanced location calibration for maximum accuracy
    const calibrateLocation = useCallback(async () => {
        setIsCalibrating(true);
        
        try {
            // Multiple high-precision readings over time
            const calibrationReadings: LocationData[] = [];
            const readingCount = 10;
            const intervalMs = 2000; // 2 seconds between readings

            for (let i = 0; i < readingCount; i++) {
                try {
                    const reading = await new Promise<LocationData>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                resolve({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                    timestamp: new Date().toISOString(),
                                    accuracy: position.coords.accuracy
                                });
                            },
                            reject,
                            {
                                enableHighAccuracy: true,
                                timeout: 8000,
                                maximumAge: 0 // Always get fresh reading
                            }
                        );
                    });

                    calibrationReadings.push(reading);
                    
                    // Wait before next reading (except for last iteration)
                    if (i < readingCount - 1) {
                        await new Promise(resolve => setTimeout(resolve, intervalMs));
                    }
                } catch (error) {
                    console.warn(`Calibration reading ${i + 1} failed:`, error);
                }
            }

            if (calibrationReadings.length >= 3) {
                // Filter out outliers and calculate calibrated position
                const calibratedLocation = calculateCalibratedPosition(calibrationReadings);
                setCurrentLocation(calibratedLocation);
                assessLocationQuality(calibratedLocation);
                
                if (isTracking && allowLocationSharing) {
                    updateLocationOnServer(calibratedLocation);
                }
            }
        } catch (error) {
            console.error('Location calibration failed:', error);
        } finally {
            setIsCalibrating(false);
        }
    }, [isTracking, allowLocationSharing, assessLocationQuality]);

    // Calculate calibrated position from multiple readings
    const calculateCalibratedPosition = useCallback((readings: LocationData[]): LocationData => {
        // Remove outliers using statistical methods
        const latitudes = readings.map(r => r.lat).sort((a, b) => a - b);
        const longitudes = readings.map(r => r.lng).sort((a, b) => a - b);
        
        // Remove top and bottom 10% as outliers
        const trimPercent = 0.1;
        const trimCount = Math.floor(readings.length * trimPercent);
        
        const trimmedLatitudes = latitudes.slice(trimCount, -trimCount || undefined);
        const trimmedLongitudes = longitudes.slice(trimCount, -trimCount || undefined);
        
        // Calculate weighted average based on accuracy
        let totalWeight = 0;
        let weightedLat = 0;
        let weightedLng = 0;
        let bestAccuracy = Infinity;

        readings.forEach(reading => {
            const lat = reading.lat;
            const lng = reading.lng;
            
            // Only include readings within trimmed range
            if (trimmedLatitudes.includes(lat) && trimmedLongitudes.includes(lng)) {
                const weight = reading.accuracy ? 1 / Math.max(reading.accuracy, 1) : 1;
                totalWeight += weight;
                weightedLat += lat * weight;
                weightedLng += lng * weight;
                
                if (reading.accuracy && reading.accuracy < bestAccuracy) {
                    bestAccuracy = reading.accuracy;
                }
            }
        });

        const calibratedLat = weightedLat / totalWeight;
        const calibratedLng = weightedLng / totalWeight;
        
        // Improved accuracy through calibration
        const calibratedAccuracy = Math.max(bestAccuracy * 0.5, 1);

        return {
            lat: calibratedLat,
            lng: calibratedLng,
            timestamp: new Date().toISOString(),
            accuracy: calibratedAccuracy
        };
    }, []);

    // Validate location against known landmarks for accuracy verification
    const validateLocationAccuracy = useCallback(async (location: LocationData): Promise<boolean> => {
        try {
            // Use reverse geocoding to verify location makes sense
            if (window.google && window.google.maps) {
                const geocoder = new window.google.maps.Geocoder();
                
                return new Promise((resolve) => {
                    geocoder.geocode(
                        { location: { lat: location.lat, lng: location.lng } },
                        (results: any, status: any) => {
                            if (status === 'OK' && results && results.length > 0) {
                                // Check if the result is in a reasonable location (not in ocean, etc.)
                                const result = results[0];
                                const hasValidAddress = result.formatted_address && 
                                    !result.formatted_address.includes('Unnamed Road') &&
                                    result.address_components.length > 2;
                                
                                resolve(hasValidAddress);
                            } else {
                                resolve(false);
                            }
                        }
                    );
                });
            }
            
            return true; // Default to valid if no validation available
        } catch (error) {
            console.warn('Location validation failed:', error);
            return true; // Default to valid on error
        }
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || !currentLocation || !window.google) return;

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
                }
            ]
        });

        mapInstanceRef.current = map;
        updateMapMarkers();
    };

    const updateMapMarkers = () => {
        if (!mapInstanceRef.current || !window.google) return;

        const map = mapInstanceRef.current;

        // Clear existing markers (in production, track markers to clear them)

        // Add current user location
        if (currentLocation) {
            new window.google.maps.Marker({
                position: currentLocation,
                map: map,
                title: 'Your Location',
                icon: {
                    url: createUserLocationIcon('#3B82F6'),
                    scaledSize: new window.google.maps.Size(32, 32)
                }
            });
        }

        // Add safety zones
        safetyZones.forEach(zone => {
            const marker = new window.google.maps.Marker({
                position: zone.coordinates,
                map: map,
                title: zone.name,
                icon: {
                    url: getSafetyZoneIcon(zone.type),
                    scaledSize: new window.google.maps.Size(28, 28)
                }
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: createSafetyZoneInfoContent(zone)
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });

        // Add nearby users (only for authorized personnel)
        if (canTrackUsers && showUserTracking) {
            nearbyUsers.forEach(user => {
                if (user.privacyLevel === 'private' && !canViewAllUsers) return;
                if (user.privacyLevel === 'emergency_only' && !emergencyMode) return;

                const marker = new window.google.maps.Marker({
                    position: user.location,
                    map: map,
                    title: `${user.userName} (${user.userRole})`,
                    icon: {
                        url: createUserLocationIcon(getUserStatusColor(user.safetyStatus)),
                        scaledSize: new window.google.maps.Size(24, 24)
                    }
                });

                const infoWindow = new window.google.maps.InfoWindow({
                    content: createUserInfoContent(user)
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            });
        }

        // Add risk zones
        riskZones.forEach(zone => {
            // Add risk zone circle
            const riskCircle = new window.google.maps.Circle({
                strokeColor: getRiskZoneColor(zone.riskLevel),
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: getRiskZoneColor(zone.riskLevel),
                fillOpacity: 0.2,
                map: map,
                center: zone.center,
                radius: zone.radius
            });

            // Add risk zone marker
            const riskMarker = new window.google.maps.Marker({
                position: zone.center,
                map: map,
                title: zone.name,
                icon: {
                    url: createRiskZoneIcon(zone.riskLevel),
                    scaledSize: new window.google.maps.Size(24, 24)
                }
            });

            const riskInfoWindow = new window.google.maps.InfoWindow({
                content: createRiskZoneInfoContent(zone)
            });

            riskMarker.addListener('click', () => {
                riskInfoWindow.open(map, riskMarker);
            });
        });
    };

    const createUserLocationIcon = (color: string) => {
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
      </svg>
    `);
    };

    const getSafetyZoneIcon = (type: string) => {
        const colors = {
            police_station: '#3B82F6',
            hospital: '#EF4444',
            safe_house: '#10B981',
            embassy: '#8B5CF6',
            hotel: '#F59E0B',
            public_place: '#6B7280'
        };

        const color = colors[type as keyof typeof colors] || colors.public_place;

        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
      </svg>
    `);
    };

    const getUserStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return '#10B981';
            case 'warning': return '#F59E0B';
            case 'emergency': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const createSafetyZoneInfoContent = (zone: SafetyZone) => {
        return `
      <div style="max-width: 250px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${zone.name}</h3>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">${zone.address}</p>
        ${zone.distanceFormatted ? `<p style="margin: 0 0 4px 0; color: #3B82F6; font-size: 12px;">📍 ${zone.distanceFormatted}</p>` : ''}
        ${zone.contact ? `<p style="margin: 0 0 4px 0; color: #059669; font-size: 12px;">📞 ${zone.contact}</p>` : ''}
        ${zone.verified ? '<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✓ Verified</span>' : ''}
      </div>
    `;
    };

    const createUserInfoContent = (user: UserLocation) => {
        return `
      <div style="max-width: 200px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${user.userName}</h3>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">Role: ${user.userRole}</p>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">Status: ${user.safetyStatus}</p>
        <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">Last seen: ${user.lastSeen}</p>
        ${user.isTracking ? '<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">🔴 Live</span>' : ''}
      </div>
    `;
    };

    const getRiskZoneColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return '#10B981';
            case 'medium': return '#F59E0B';
            case 'high': return '#EF4444';
            case 'critical': return '#DC2626';
            default: return '#6B7280';
        }
    };

    const createRiskZoneIcon = (riskLevel: string) => {
        const color = getRiskZoneColor(riskLevel);
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="${color}" stroke="#FFFFFF" stroke-width="1"/>
            </svg>
        `);
    };

    const createRiskZoneInfoContent = (zone: any) => {
        return `
            <div style="max-width: 300px; padding: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="background: ${getRiskZoneColor(zone.riskLevel)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-right: 8px;">
                        ${zone.riskLevel.toUpperCase()} RISK
                    </span>
                    <h3 style="margin: 0; font-weight: bold; color: #1F2937; font-size: 14px;">${zone.name}</h3>
                </div>
                <div style="margin-bottom: 8px;">
                    <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #EF4444;">⚠️ Risk Factors:</h4>
                    <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #6B7280;">
                        ${zone.reasons.map((reason: string) => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #10B981;">💡 Recommendations:</h4>
                    <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #6B7280;">
                        ${zone.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    };

    const centerOnLocation = () => {
        if (mapInstanceRef.current && currentLocation) {
            mapInstanceRef.current.setCenter(currentLocation);
            mapInstanceRef.current.setZoom(16);
        }
    };

    const refreshData = () => {
        getCurrentLocation();
        if (currentLocation) {
            fetchNearbySafetyZones();
            if (canTrackUsers) {
                fetchNearbyUsers();
            }
        }
    };

    // Background accuracy improvement service
    useEffect(() => {
        let accuracyImprovementInterval: NodeJS.Timeout;

        if (isTracking && currentLocation) {
            // Periodically try to improve accuracy
            accuracyImprovementInterval = setInterval(async () => {
                if (currentLocation?.accuracy && currentLocation.accuracy > 20) {
                    try {
                        const improvedLocation = await getHighPrecisionLocation();
                        if (improvedLocation.accuracy && improvedLocation.accuracy < currentLocation.accuracy * 0.8) {
                            setCurrentLocation(improvedLocation);
                            assessLocationQuality(improvedLocation);
                            updateLocationOnServer(improvedLocation);
                        }
                    } catch (error) {
                        console.log('Background accuracy improvement failed:', error);
                    }
                }
            }, 30000); // Try every 30 seconds
        }

        return () => {
            if (accuracyImprovementInterval) {
                clearInterval(accuracyImprovementInterval);
            }
        };
    }, [isTracking, currentLocation, getHighPrecisionLocation, assessLocationQuality]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
                    <p className="text-sm text-muted-foreground">
                        Google Maps API key not configured.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Map Controls */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Location & Safety Map</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Badge variant={isLocationPermissionGranted ? "default" : "destructive"}>
                                {isLocationPermissionGranted ? "Location Enabled" : "Location Disabled"}
                            </Badge>
                            {isTracking && (
                                <Badge variant="default" className="bg-green-500">
                                    <Activity className="w-3 h-3 mr-1" />
                                    Live Tracking
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Risk Alert */}
                    {riskAlert && (
                        <div className={`p-3 rounded-lg border-l-4 ${currentRiskLevel === 'critical' ? 'bg-red-50 border-red-500 text-red-800' :
                                currentRiskLevel === 'high' ? 'bg-orange-50 border-orange-500 text-orange-800' :
                                    currentRiskLevel === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                                        'bg-blue-50 border-blue-500 text-blue-800'
                            }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{riskAlert}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setRiskAlert(null)}
                                    className="h-6 w-6 p-0"
                                >
                                    ×
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Location Search */}
                    <div className="relative">
                        <div className="flex space-x-2">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="Search for places, addresses, landmarks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            searchLocation(searchQuery);
                                        }
                                    }}
                                    className="pr-10"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => searchLocation(searchQuery)}
                                disabled={!searchQuery.trim() || isSearching}
                                size="sm"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        onClick={() => navigateToLocation(
                                            {
                                                lat: result.geometry.location.lat(),
                                                lng: result.geometry.location.lng()
                                            },
                                            result.name
                                        )}
                                    >
                                        <div className="font-medium text-sm">{result.name}</div>
                                        <div className="text-xs text-gray-500">{result.formatted_address}</div>
                                        {result.rating && (
                                            <div className="flex items-center mt-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span className="text-xs text-gray-600 ml-1">{result.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Controls */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={getCurrentLocation}
                            variant="outline"
                            size="sm"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Get Location
                        </Button>

                        {allowLocationSharing && (
                            <Button
                                onClick={isTracking ? stopLocationTracking : startLocationTracking}
                                variant={isTracking ? "destructive" : "default"}
                                size="sm"
                            >
                                {isTracking ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                            </Button>
                        )}

                        <Button
                            onClick={centerOnLocation}
                            variant="outline"
                            size="sm"
                            disabled={!currentLocation}
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            Center Map
                        </Button>

                        <Button
                            onClick={refreshData}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>

                        <Button
                            onClick={calibrateLocation}
                            variant="outline"
                            size="sm"
                            disabled={isCalibrating || !isLocationPermissionGranted}
                        >
                            {isCalibrating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            ) : (
                                <Target className="w-4 h-4 mr-2" />
                            )}
                            {isCalibrating ? 'Calibrating...' : 'Calibrate'}
                        </Button>
                    </div>

                    {/* Privacy Controls */}
                    {allowLocationSharing && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium">Privacy Level:</span>
                            <select
                                value={privacyLevel}
                                onChange={(e) => setPrivacyLevel(e.target.value as any)}
                                className="text-sm border rounded px-2 py-1"
                            >
                                <option value="authorities_only">Authorities Only</option>
                                <option value="emergency_only">Emergency Only</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                            <div className="flex items-center text-sm text-muted-foreground">
                                {privacyLevel === 'private' ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
                                {privacyLevel === 'private' && 'Only you can see your location'}
                                {privacyLevel === 'authorities_only' && 'Police & authorities can track you'}
                                {privacyLevel === 'emergency_only' && 'Visible only during emergencies'}
                                {privacyLevel === 'public' && 'Everyone can see your location'}
                            </div>
                        </div>
                    )}

                    {/* Enhanced Statistics with GPS Quality */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{safetyZones.length}</div>
                            <div className="text-xs text-muted-foreground">Safety Zones</div>
                        </div>
                        {canTrackUsers && (
                            <div>
                                <div className="text-2xl font-bold text-green-600">{nearbyUsers.length}</div>
                                <div className="text-xs text-muted-foreground">Nearby Users</div>
                            </div>
                        )}
                        <div>
                            <div className={`text-2xl font-bold ${
                                currentLocation?.accuracy && currentLocation.accuracy <= 10 ? 'text-green-600' :
                                currentLocation?.accuracy && currentLocation.accuracy <= 30 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                                {currentLocation?.accuracy ? Math.round(currentLocation.accuracy) : 'N/A'}m
                            </div>
                            <div className="text-xs text-muted-foreground">GPS Accuracy</div>
                        </div>
                        <div>
                            <div className={`text-lg font-bold ${
                                gpsSignalQuality === 'excellent' ? 'text-green-600' :
                                gpsSignalQuality === 'good' ? 'text-blue-600' :
                                gpsSignalQuality === 'fair' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                                {locationConfidence}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {gpsSignalQuality.charAt(0).toUpperCase() + gpsSignalQuality.slice(1)} Signal
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-orange-600">
                                {currentLocation ? new Date(currentLocation.timestamp).toLocaleTimeString() : 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">Last Update</div>
                        </div>
                    </div>

                    {/* GPS Quality Indicator */}
                    {currentLocation && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Location Quality</span>
                                <Badge className={
                                    gpsSignalQuality === 'excellent' ? 'bg-green-500' :
                                    gpsSignalQuality === 'good' ? 'bg-blue-500' :
                                    gpsSignalQuality === 'fair' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }>
                                    {gpsSignalQuality.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        gpsSignalQuality === 'excellent' ? 'bg-green-500' :
                                        gpsSignalQuality === 'good' ? 'bg-blue-500' :
                                        gpsSignalQuality === 'fair' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${locationConfidence}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>Accuracy: {currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : 'Unknown'}</span>
                                <span>Confidence: {locationConfidence}%</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Map Container */}
            <div className="relative">
                <div
                    ref={mapRef}
                    className="w-full h-96 rounded-lg border"
                    style={{ minHeight: '400px' }}
                />

                {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading map...</p>
                        </div>
                    </div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border max-w-xs">
                    <h4 className="text-sm font-semibold mb-2">Legend</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Your Location</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Safety Zones</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full opacity-30"></div>
                            <span>Risk Zones</span>
                        </div>
                        {canTrackUsers && showUserTracking && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span>Safe Users</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span>Warning Status</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span>Emergency</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}