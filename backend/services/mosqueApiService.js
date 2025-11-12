import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MASJIDI_API_KEY = process.env.MASJIDI_API_KEY;
const MASJIDI_BASE_URL = 'https://api.masjidiapp.com';

/**
 * Search mosques from MasjidiAPI
 * This is prepared for future integration when API key is available
 * @param {Object} params - Search parameters
 * @param {number} params.latitude - Latitude
 * @param {number} params.longitude - Longitude
 * @param {number} params.radius - Search radius in km
 * @returns {Promise<Array>} Array of mosque objects
 */
export const searchMosquesFromAPI = async ({ latitude, longitude, radius = 10 }) => {
  // Check if API key is available
  if (!MASJIDI_API_KEY || MASJIDI_API_KEY === '') {
    console.warn('MasjidiAPI key not configured. Using local database only.');
    return [];
  }

  try {
    // This endpoint structure is based on common patterns
    // Adjust when actual documentation is available
    const response = await axios.get(`${MASJIDI_BASE_URL}/v1/mosques/search`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius
      },
      headers: {
        'Authorization': `Bearer ${MASJIDI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('MasjidiAPI Error:', error.message);
    // Don't throw error, just return empty array so local mosques still work
    return [];
  }
};

/**
 * Get mosque details by ID from MasjidiAPI
 * @param {string} mosqueId - Mosque ID
 * @returns {Promise<Object>} Mosque details
 */
export const getMosqueDetailsFromAPI = async (mosqueId) => {
  if (!MASJIDI_API_KEY || MASJIDI_API_KEY === '') {
    return null;
  }

  try {
    const response = await axios.get(`${MASJIDI_BASE_URL}/v1/mosques/${mosqueId}`, {
      headers: {
        'Authorization': `Bearer ${MASJIDI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('MasjidiAPI Error:', error.message);
    return null;
  }
};

/**
 * Check if MasjidiAPI is configured and available
 * @returns {boolean} True if API is configured
 */
export const isMasjidiAPIAvailable = () => {
  return MASJIDI_API_KEY && MASJIDI_API_KEY !== '';
};
