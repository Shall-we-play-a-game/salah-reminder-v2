import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_NINJAS_KEY = process.env.API_NINJAS_KEY;
const API_NINJAS_BASE_URL = 'https://api.api-ninjas.com/v1';

/**
 * Search cities using API Ninjas City API
 * @param {Object} params - Search parameters
 * @param {string} params.name - City name to search
 * @param {string} params.country - ISO 3166 country code (optional)
 * @param {number} params.limit - Number of results (default 30, max 30)
 * @returns {Promise<Array>} Array of city objects
 */
export const searchCities = async ({ name, country, limit = 1 }) => {
  try {
    const params = {};
    if (name) params.name = name;
    if (country) params.country = country;
    // Note: limit parameter is for premium subscribers only, so we don't include it

    const response = await axios.get(`${API_NINJAS_BASE_URL}/city`, {
      params,
      headers: {
        'X-Api-Key': API_NINJAS_KEY
      }
    });

    // Free tier returns max 1 result per request
    // We can slice the results if needed
    const results = response.data;
    return Array.isArray(results) ? results.slice(0, Math.min(limit, 1)) : results;
  } catch (error) {
    console.error('City API Error:', error.message);
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    throw new Error('Failed to fetch cities from API');
  }
};

/**
 * Get popular cities from different countries
 * This is a curated list to provide good starting options
 * @returns {Promise<Array>} Array of popular cities
 */
export const getPopularCities = async () => {
  const popularCityNames = [
    'New York',
    'London',
    'Dubai',
    'Riyadh',
    'Makkah',
    'Madinah',
    'Istanbul',
    'Cairo',
    'Jakarta',
    'Kuala Lumpur',
    'Karachi',
    'Dhaka',
    'Delhi',
    'Mumbai',
    'Lahore',
    'Tehran',
    'Baghdad',
    'Ankara',
    'Amman',
    'Doha',
    'Kuwait City',
    'Muscat',
    'Abu Dhabi',
    'Casablanca',
    'Algiers',
    'Tunis',
    'Beirut',
    'Damascus',
    'Sana\'a',
    'Kabul'
  ];

  try {
    // Fetch all popular cities in parallel
    const cityPromises = popularCityNames.map(cityName =>
      searchCities({ name: cityName, limit: 1 })
        .then(cities => cities[0])
        .catch(() => null)
    );

    const cities = await Promise.all(cityPromises);
    
    // Filter out null values and duplicates
    const validCities = cities
      .filter(city => city !== null)
      .filter((city, index, self) =>
        index === self.findIndex(c => c.name === city.name && c.country === city.country)
      );

    return validCities;
  } catch (error) {
    console.error('Error fetching popular cities:', error.message);
    return [];
  }
};

/**
 * Get cities by country
 * @param {string} country - ISO 3166 country code
 * @returns {Promise<Array>} Array of cities in the country
 */
export const getCitiesByCountry = async (country) => {
  try {
    const response = await axios.get(`${API_NINJAS_BASE_URL}/city`, {
      params: { country, limit: 30 },
      headers: {
        'X-Api-Key': API_NINJAS_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('City API Error:', error.message);
    throw new Error('Failed to fetch cities by country');
  }
};
