# API Integration Guide

This document explains how to integrate external APIs for cities and mosques.

## Current Status

### ✅ Implemented
- **Cities Database**: 50+ major cities seeded in MongoDB
- **City Search API**: `/api/cities/search` - Search cities by name/country
- **Mosque Sorting**: Proper alphabetical sorting with collation
- **API Structure**: Ready for external API integration

### 🔧 Prepared for Integration
- **API Ninjas City API**: Structure ready, limited by free tier
- **MasjidiAPI**: Structure ready, requires API key

---

## API Ninjas Integration (Cities)

### About
- **Website**: https://api-ninjas.com
- **Documentation**: https://api-ninjas.com/api/city
- **Free Tier**: 50,000 requests/month
- **Limitation**: Free tier returns only 1 result per query

### Setup Instructions

1. **Get API Key**:
   ```
   1. Visit https://api-ninjas.com
   2. Click "Sign Up" (top right)
   3. Verify email
   4. Login and navigate to dashboard
   5. Copy your API key
   ```

2. **Add to Environment**:
   ```bash
   # In /app/backend/.env
   API_NINJAS_KEY="your_actual_api_key_here"
   ```

3. **Restart Backend**:
   ```bash
   sudo supervisorctl restart backend
   ```

### Current Implementation

The city service (`/app/backend/services/cityService.js`) is prepared for API Ninjas but currently **uses seeded database** due to free tier limitations.

**Why Database Instead of API?**
- Free tier returns only 1 city per query
- Can't get list of cities efficiently
- Database provides better performance
- No rate limits

**API Service Location**: `/app/backend/services/cityService.js`
- Functions: `searchCities()`, `getCitiesByCountry()`
- Ready to use if upgraded to premium tier

---

## MasjidiAPI Integration (Mosques)

### About
- **Website**: https://github.com/MasjidiApp/MasjidiAPI
- **Documentation**: https://api.masjidiapp.com/docs (currently down)
- **Type**: Open-source, crowd-sourced mosque database
- **Features**: Mosque listings, prayer times, Iqama times

### Setup Instructions

1. **Get API Key**:
   ```
   1. Visit WhatsApp: https://wa.me/15305086624
   2. Request API key for your project
   3. Mention it's for a Salah Reminder application
   4. Wait for approval (usually quick)
   ```

2. **Add to Environment**:
   ```bash
   # In /app/backend/.env
   MASJIDI_API_KEY="your_api_key_here"
   ```

3. **Restart Backend**:
   ```bash
   sudo supervisorctl restart backend
   ```

4. **Verify Configuration**:
   ```bash
   curl https://your-domain.com/api/mosques/api-status
   ```

### Current Implementation

**Service Location**: `/app/backend/services/mosqueApiService.js`

**Available Functions**:
- `searchMosquesFromAPI({ latitude, longitude, radius })` - Search nearby mosques
- `getMosqueDetailsFromAPI(mosqueId)` - Get mosque details
- `isMasjidiAPIAvailable()` - Check if API is configured

**Endpoints**:
- `GET /api/mosques/search-external?lat=40.7128&lng=-74.0060&radius=10`
- `GET /api/mosques/api-status`

**Behavior**:
- If API key not configured: Returns error message with setup instructions
- If API key configured: Fetches mosques from MasjidiAPI
- Graceful fallback: Local database continues to work

---

## Testing External APIs

### Test Cities API
```bash
# Search for a city
curl "https://your-domain.com/api/cities/search?name=London"

# Get all cities
curl "https://your-domain.com/api/cities"

# Get cities by country
curl "https://your-domain.com/api/cities/country/Pakistan"
```

### Test Mosque External API
```bash
# Check API status
curl "https://your-domain.com/api/mosques/api-status"

# Search mosques (requires MasjidiAPI key)
curl "https://your-domain.com/api/mosques/search-external?lat=40.7128&lng=-74.0060&radius=10"
```

---

## Database vs API: When to Use What

### Use Database (Current Approach)
**Pros**:
- Faster response times
- No rate limits
- Works offline
- Free
- Consistent data

**Cons**:
- Needs periodic updates
- Limited to seeded data
- Storage required

### Use External API
**Pros**:
- Always up-to-date
- Comprehensive data
- No maintenance
- Global coverage

**Cons**:
- Rate limits
- Costs (for premium)
- Network dependency
- Slower response

### Recommendation
- **Cities**: Use database (already implemented)
- **Mosques**: Hybrid approach
  - Local database for user-created mosques
  - External API for discovering new mosques
  - Import feature to save external mosques locally

---

## Upgrading to Premium APIs

### If You Need More Features

**API Ninjas Premium**:
- Unlimited cities per query
- Higher rate limits
- More data fields
- Pricing: Contact API Ninjas

**MasjidiAPI Premium**:
- May offer higher limits
- Contact via WhatsApp for details

---

## Troubleshooting

### Cities API Not Working
1. Check API key in `.env`: `echo $API_NINJAS_KEY`
2. Verify backend logs: `tail -f /var/log/supervisor/backend.err.log`
3. Test API directly:
   ```bash
   curl -H "X-Api-Key: YOUR_KEY" "https://api.api-ninjas.com/v1/city?name=London"
   ```

### Mosque API Not Working
1. Check if configured: `curl /api/mosques/api-status`
2. Verify API key is correct
3. Check if MasjidiAPI service is up
4. Review backend logs for error messages

---

## Future Enhancements

### Planned Features
1. **Mosque Import**: Save external mosques to local database
2. **Periodic Sync**: Auto-update mosque data from API
3. **Hybrid Search**: Search both local and external sources
4. **Cache Strategy**: Cache API responses for performance
5. **Fallback Chain**: Try multiple APIs if one fails

### Contributing
To add new API integrations:
1. Create service in `/app/backend/services/`
2. Add controller functions in `/app/backend/controllers/`
3. Update routes in `/app/backend/routes/`
4. Document in this guide
5. Add environment variables
6. Test thoroughly

---

## Summary

✅ **What Works Now**:
- City database with 50+ cities
- City search and filtering
- Mosque sorting with proper collation
- API structure ready for integration

🔧 **What Needs Setup**:
- API Ninjas key (optional - for future use)
- MasjidiAPI key (recommended - for mosque discovery)

📚 **Resources**:
- API Ninjas: https://api-ninjas.com
- MasjidiAPI: https://github.com/MasjidiApp/MasjidiAPI
- Backend Code: `/app/backend/services/`
