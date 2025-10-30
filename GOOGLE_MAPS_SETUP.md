# Google Maps API Setup Guide for Yatri Rakshak

## Overview
This guide will help you set up Google Maps API for the Yatri Rakshak women safety features, including location tracking, nearby safety zones, and emergency services mapping.

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create New Project
- Click "Select a project" dropdown
- Click "New Project"
- Project name: "Yatri Rakshak Maps"
- Organization: (optional)
- Click "Create"

## Step 2: Enable Required APIs

### 2.1 Enable Maps JavaScript API
- Go to "APIs & Services" > "Library"
- Search for "Maps JavaScript API"
- Click on it and press "Enable"

### 2.2 Enable Places API (Optional but Recommended)
- Search for "Places API"
- Click on it and press "Enable"
- This enables nearby places search functionality

### 2.3 Enable Geocoding API (Optional)
- Search for "Geocoding API"
- Click on it and press "Enable"
- This enables address to coordinates conversion

## Step 3: Create API Key

### 3.1 Go to Credentials
- Navigate to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "API Key"
- Copy the generated API key

### 3.2 Restrict API Key (Important for Security)
- Click on the API key you just created
- Under "API restrictions":
  - Select "Restrict key"
  - Choose the APIs you enabled:
    - Maps JavaScript API
    - Places API (if enabled)
    - Geocoding API (if enabled)

### 3.3 Set Application Restrictions
- Under "Application restrictions":
  - For development: Select "None" (temporarily)
  - For production: Select "HTTP referrers (web sites)"
    - Add your domains:
      - `localhost:3000/*` (for development)
      - `your-domain.com/*` (for production)
      - `*.your-domain.com/*` (for subdomains)

## Step 4: Configure Environment Variables

### 4.1 Development Setup (.env.local)
```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4.2 Production Setup (.env.production)
```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix makes the API key available to the client-side code.

## Step 5: Test the Integration

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Navigate to Women Safety Dashboard
- Go to: http://localhost:3000/dashboard/women-safety
- Click on "Safe Zones" tab
- You should see the Google Map with your location and nearby safety zones

### 5.3 Test Features
- **Location Detection**: Allow location access when prompted
- **Map Interaction**: Click on markers to see info windows
- **Zoom Controls**: Use map controls to zoom in/out
- **Center Location**: Click "My Location" button to center map

## Step 6: Production Deployment

### 6.1 Update API Key Restrictions
- Go back to Google Cloud Console > Credentials
- Edit your API key
- Update HTTP referrers to include your production domain
- Remove localhost entries for production keys

### 6.2 Monitor Usage
- Go to "APIs & Services" > "Dashboard"
- Monitor your API usage and quotas
- Set up billing alerts if needed

## API Usage and Quotas

### Free Tier Limits (as of 2025)
- **Maps JavaScript API**: $200 free credit per month
- **Places API**: $200 free credit per month
- **Geocoding API**: $200 free credit per month

### Typical Usage for Yatri Rakshak
- **Map loads**: ~1,000-5,000 per month (small app)
- **Places searches**: ~500-2,000 per month
- **Geocoding requests**: ~100-500 per month

Most small to medium applications stay within the free tier.

## Security Best Practices

### 6.1 API Key Security
- ✅ Always restrict API keys to specific APIs
- ✅ Use HTTP referrer restrictions for web apps
- ✅ Never commit API keys to version control
- ✅ Use different keys for development and production
- ✅ Regularly rotate API keys

### 6.2 Usage Monitoring
- Set up quota alerts in Google Cloud Console
- Monitor for unusual usage patterns
- Implement client-side rate limiting if needed

## Troubleshooting

### Common Issues

#### 1. "This page can't load Google Maps correctly"
**Cause**: Invalid or restricted API key
**Solution**: 
- Check API key is correct in environment variables
- Verify API restrictions allow your domain
- Ensure Maps JavaScript API is enabled

#### 2. Map shows but no markers appear
**Cause**: Location permission denied or API errors
**Solution**:
- Check browser console for errors
- Verify location permissions are granted
- Check if Places API is enabled (for nearby places)

#### 3. "RefererNotAllowedMapError"
**Cause**: Domain not allowed in API key restrictions
**Solution**:
- Add your domain to HTTP referrer restrictions
- For development, add `localhost:3000/*`

#### 4. Quota exceeded errors
**Cause**: API usage exceeded free tier limits
**Solution**:
- Check usage in Google Cloud Console
- Enable billing if needed
- Optimize API calls to reduce usage

### Debug Mode
Add this to your environment for debugging:
```env
NEXT_PUBLIC_GOOGLE_MAPS_DEBUG=true
```

## Advanced Features (Optional)

### 7.1 Custom Map Styling
The SafetyMap component includes custom styling to hide unnecessary POIs and focus on safety-related locations.

### 7.2 Real-time Location Tracking
For enhanced safety features, you can implement:
- Continuous location updates
- Geofencing alerts
- Route tracking and sharing

### 7.3 Offline Maps (Future Enhancement)
Consider implementing offline map caching for areas with poor connectivity.

## Cost Optimization Tips

### 8.1 Reduce API Calls
- Cache map data when possible
- Use static maps for non-interactive displays
- Implement client-side filtering before API calls

### 8.2 Optimize Map Loading
- Load maps only when needed (lazy loading)
- Use appropriate zoom levels
- Limit the number of markers displayed

### 8.3 Monitor and Alert
- Set up billing alerts at 50%, 75%, and 90% of budget
- Use Google Cloud monitoring for usage tracking

## Support Resources

- **Google Maps Documentation**: https://developers.google.com/maps/documentation
- **API Key Best Practices**: https://developers.google.com/maps/api-security-best-practices
- **Pricing Calculator**: https://developers.google.com/maps/billing-and-pricing
- **Community Support**: https://stackoverflow.com/questions/tagged/google-maps

---

**Security Note**: Never expose API keys in client-side code without proper restrictions. Always use environment variables and implement proper security measures.