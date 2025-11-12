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
 * Get all cities (optionally sorted)
 * GET /api/cities?sortBy=name&sortOrder=asc
 */
export const getAll = async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1;
    }

    const cities = await City
      .find({}, { _id: 0, __v: 0 })
      .sort(sort)
      .collation({ locale: 'en', strength: 2 });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cities by country
 * GET /api/cities/country/:countryName
 */
export const byCountry = async (req, res) => {
  try {
    const { countryName } = req.params;

    if (!countryName) {
      return res.status(400).json({ detail: 'Country name is required' });
    }

    const cities = await City
      .find({ country: { $regex: countryName, $options: 'i' } }, { _id: 0, __v: 0 })
      .sort({ name: 1 })
      .collation({ locale: 'en', strength: 2 });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
