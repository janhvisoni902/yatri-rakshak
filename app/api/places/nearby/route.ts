import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '5000'); // meters
    const type = searchParams.get('type') || 'all'; // police, hospital, etc.

    if (lat === 0 || lng === 0) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      // Fallback to mock data if no API key
      return getMockNearbyPlaces(lat, lng, radius, type);
    }

    try {
      // Use Google Places API for real data
      const placeTypes = getGooglePlaceTypes(type);
      const allPlaces: any[] = [];

      for (const placeType of placeTypes) {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&key=${apiKey}`;
        
        const response = await fetch(placesUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results) {
          const formattedPlaces = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            type: mapGoogleTypeToSafetyType(placeType),
            address: place.vicinity || place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            rating: place.rating || 0,
            verified: true,
            contact: place.formatted_phone_number || null,
            hours: place.opening_hours?.open_now ? '24/7' : 'Check hours',
            distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
            services: getServicesForType(mapGoogleTypeToSafetyType(placeType)),
            facilities: getFacilitiesForType(mapGoogleTypeToSafetyType(placeType)),
            googlePlaceId: place.place_id,
            photos: place.photos ? place.photos.slice(0, 1).map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
            ) : []
          }));

          allPlaces.push(...formattedPlaces);
        }
      }

      // Sort by distance and limit results
      const sortedPlaces = allPlaces
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20)
        .map(place => ({
          ...place,
          distanceFormatted: place.distance < 1 ? 
            `${Math.round(place.distance * 1000)}m` : 
            `${place.distance.toFixed(1)}km`
        }));

      return NextResponse.json({
        success: true,
        places: sortedPlaces,
        total: sortedPlaces.length,
        source: 'google_places_api',
        location: { lat, lng },
        radius: `${radius}m`
      });

    } catch (apiError) {
      console.error('Google Places API error:', apiError);
      // Fallback to mock data if API fails
      return getMockNearbyPlaces(lat, lng, radius, type);
    }

  } catch (error) {
    console.error('Nearby places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}

// Helper functions
function getGooglePlaceTypes(safetyType: string): string[] {
  const typeMap: { [key: string]: string[] } = {
    police: ['police'],
    hospital: ['hospital', 'doctor', 'pharmacy'],
    safe_house: ['lodging', 'embassy'],
    embassy: ['embassy'],
    hotel: ['lodging'],
    public_place: ['tourist_attraction', 'park'],
    all: ['police', 'hospital', 'doctor', 'pharmacy', 'lodging', 'embassy', 'tourist_attraction']
  };
  
  return typeMap[safetyType] || typeMap.all;
}

function mapGoogleTypeToSafetyType(googleType: string): string {
  const typeMap: { [key: string]: string } = {
    police: 'police_station',
    hospital: 'hospital',
    doctor: 'hospital',
    pharmacy: 'hospital',
    lodging: 'hotel',
    embassy: 'embassy',
    tourist_attraction: 'public_place',
    park: 'public_place'
  };
  
  return typeMap[googleType] || 'public_place';
}

function getServicesForType(type: string): string[] {
  const services: { [key: string]: string[] } = {
    police_station: ['Emergency Response', 'Women Safety Cell', 'Tourist Help', 'Crime Reporting'],
    hospital: ['Emergency Care', 'Trauma Center', 'Women Health', 'Pharmacy'],
    safe_house: ['Counseling', 'Legal Aid', 'Temporary Shelter', 'Support Services'],
    embassy: ['Citizen Services', 'Emergency Assistance', 'Consular Support', 'Document Services'],
    hotel: ['Safe Accommodation', 'Concierge', 'Tourist Information', 'Security'],
    public_place: ['Tourist Information', 'Emergency Contact', 'First Aid', 'Public Facilities']
  };
  
  return services[type] || ['General Services'];
}

function getFacilitiesForType(type: string): string[] {
  const facilities: { [key: string]: string[] } = {
    police_station: ['CCTV Monitoring', 'Female Officers', 'Interpreter Services', '24/7 Access'],
    hospital: ['Ambulance Service', 'Female Doctors', 'Pharmacy', 'Emergency Ward'],
    safe_house: ['Female Staff', 'Confidential Support', 'Multilingual Help', 'Safe Environment'],
    embassy: ['Security', 'Interpreter Services', 'Emergency Contact', 'Consular Services'],
    hotel: ['Security Guards', 'CCTV', 'Safe Deposit', 'Reception 24/7'],
    public_place: ['Security Personnel', 'Public Toilets', 'Well-lit Area', 'Information Desk']
  };
  
  return facilities[type] || ['Basic Facilities'];
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fallback mock data function
async function getMockNearbyPlaces(lat: number, lng: number, radius: number, type: string) {
  // Mock places based on Delhi coordinates
  const mockPlaces = [
    {
      id: 'mock-1',
      name: 'Delhi Police Station - Connaught Place',
      type: 'police_station',
      address: 'Connaught Place, New Delhi',
      coordinates: { lat: lat + 0.01, lng: lng + 0.01 },
      rating: 4.5,
      verified: true,
      contact: '011-23341234',
      hours: '24/7',
      distance: calculateDistance(lat, lng, lat + 0.01, lng + 0.01),
      services: ['Emergency Response', 'Women Safety Cell', 'Tourist Help'],
      facilities: ['CCTV Monitoring', 'Female Officers', 'Interpreter Services']
    },
    {
      id: 'mock-2',
      name: 'AIIMS Emergency',
      type: 'hospital',
      address: 'All India Institute of Medical Sciences',
      coordinates: { lat: lat - 0.01, lng: lng + 0.01 },
      rating: 4.8,
      verified: true,
      contact: '011-26588500',
      hours: '24/7',
      distance: calculateDistance(lat, lng, lat - 0.01, lng + 0.01),
      services: ['Emergency Care', 'Trauma Center', 'Women Health'],
      facilities: ['Ambulance Service', 'Female Doctors', 'Pharmacy']
    },
    {
      id: 'mock-3',
      name: 'Women Safety Center',
      type: 'safe_house',
      address: 'Janpath, New Delhi',
      coordinates: { lat: lat + 0.01, lng: lng - 0.01 },
      rating: 4.7,
      verified: true,
      contact: '011-23388888',
      hours: '24/7',
      distance: calculateDistance(lat, lng, lat + 0.01, lng - 0.01),
      services: ['Counseling', 'Legal Aid', 'Temporary Shelter'],
      facilities: ['Female Staff', 'Confidential Support', 'Multilingual Help']
    }
  ];

  const filteredPlaces = mockPlaces
    .filter(place => type === 'all' || place.type === type)
    .map(place => ({
      ...place,
      distanceFormatted: place.distance < 1 ? 
        `${Math.round(place.distance * 1000)}m` : 
        `${place.distance.toFixed(1)}km`
    }));

  return NextResponse.json({
    success: true,
    places: filteredPlaces,
    total: filteredPlaces.length,
    source: 'mock_data',
    location: { lat, lng },
    radius: `${radius}m`,
    note: 'Using mock data - Google Places API key not configured'
  });
}