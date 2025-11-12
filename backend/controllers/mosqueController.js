import Mosque from '../models/Mosque.js';
import { generateId } from '../utils/helpers.js';
import { searchMosquesFromAPI, isMasjidiAPIAvailable } from '../services/mosqueApiService.js';

export const getAllMosques = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, city } = req.query;
    let query = {};
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    // Build sort object with proper collation for case-insensitive sorting
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default sort by name ascending
    }
    
    // Use collation for proper alphabetical sorting (case-insensitive)
    const mosques = await Mosque
      .find(query, { _id: 0, __v: 0 })
      .sort(sort)
      .collation({ locale: 'en', strength: 2 }); // Case-insensitive sorting
    
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMosqueById = async (req, res) => {
  try {
    const mosque = await Mosque.findOne({ id: req.params.mosque_id }, { _id: 0, __v: 0 });
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    res.json(mosque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMosque = async (req, res) => {
  try {
    const mosque = new Mosque({
      id: generateId(),
      ...req.body
    });
    await mosque.save();
    res.json(mosque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadDonationQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided' });
    }
    
    const qrCodeBase64 = req.file.buffer.toString('base64');
    
    const mosque = await Mosque.findOneAndUpdate(
      { id: req.params.mosque_id },
      { donation_qr_code: qrCodeBase64 },
      { new: true }
    );
    
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    
    res.json({ message: 'Donation QR code uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
