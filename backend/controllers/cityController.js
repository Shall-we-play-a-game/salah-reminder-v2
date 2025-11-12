import City from '../models/City.js';

/**
 * Search cities by name
 * GET /api/cities/search?name=cityname&country=US&limit=50
 */
export const search = async (req, res) => {
  try {
    const { name, country, limit } = req.query;
    
    const query = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    const cities = await City
      .find(query, { _id: 0, __v: 0 })
      .sort({ name: 1 })
      .limit(parseInt(limit) || 50)
      .collation({ locale: 'en', strength: 2 });

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
