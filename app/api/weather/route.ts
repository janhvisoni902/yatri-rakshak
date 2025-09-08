import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const location = searchParams.get('location');

    // In a real app, you would integrate with a weather API like OpenWeatherMap
    // For now, return mock weather data
    const weatherData = {
      location: location || 'Delhi, India',
      coordinates: {
        lat: lat ? parseFloat(lat) : 28.6139,
        lng: lng ? parseFloat(lng) : 77.2090
      },
      current: {
        temperature: 28,
        feelsLike: 32,
        humidity: 65,
        description: 'Partly Cloudy',
        icon: 'partly-cloudy',
        windSpeed: 12,
        windDirection: 'NW',
        uvIndex: 6,
        visibility: 10
      },
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          high: 30,
          low: 22,
          description: 'Partly Cloudy',
          icon: 'partly-cloudy',
          precipitation: 10
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 27,
          low: 20,
          description: 'Light Rain',
          icon: 'rain',
          precipitation: 80
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 32,
          low: 24,
          description: 'Sunny',
          icon: 'sunny',
          precipitation: 5
        }
      ],
      alerts: [
        {
          id: 'weather-1',
          type: 'heat',
          title: 'High Temperature Advisory',
          message: 'Temperatures expected to reach 35°C. Stay hydrated and avoid prolonged sun exposure.',
          severity: 'warning',
          validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        }
      ],
      safetyTips: [
        'Carry water bottle and stay hydrated',
        'Use sunscreen and wear a hat',
        'Avoid outdoor activities during peak sun hours (11 AM - 4 PM)',
        'Seek shade when possible'
      ],
      lastUpdated: new Date().toISOString()
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ weather: weatherData }, { status: 200 });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// For a real implementation, you would add this to your .env.local:
// OPENWEATHERMAP_API_KEY=your_api_key_here
// 
// Then use this function to get real weather data:
/*
async function getRealWeatherData(lat: number, lng: number) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    // ... more mappings
  };
}
*/
