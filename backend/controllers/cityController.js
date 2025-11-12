import { searchCities, getPopularCities, getCitiesByCountry } from '../services/cityService.js';

/**
 * Search cities by name
 * GET /api/cities/search?name=cityname&country=US&limit=10
 */
export const search = async (req, res) => {
  try {
    const { name, country, limit } = req.query;

    if (!name) {
      return res.status(400).json({ detail: 'City name is required' });
    }

    const cities = await searchCities({ 
      name, 
      country, 
      limit: parseInt(limit) || 30 
    });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get popular cities worldwide
 * GET /api/cities/popular
 */
export const popular = async (req, res) => {
  try {
    const cities = await getPopularCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cities by country
 * GET /api/cities/country/:countryCode
 */
export const byCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;

    if (!countryCode) {
      return res.status(400).json({ detail: 'Country code is required' });
    }

    const cities = await getCitiesByCountry(countryCode);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
