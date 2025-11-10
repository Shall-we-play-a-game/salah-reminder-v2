import User from '../models/User.js';
import Mosque from '../models/Mosque.js';
import { generateId, hashPassword, verifyPassword } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }
    
    const passwordHash = await hashPassword(password);
    let mosqueId = null;
    
    if (role === 'admin') {
      const {
        mosque_name, mosque_phone, mosque_alternate_phone,
        mosque_address, mosque_district, mosque_city,
        mosque_state, mosque_country, mosque_latitude, mosque_longitude
      } = req.body;
      
      if (!mosque_name || !mosque_phone || !mosque_address || !mosque_district || !mosque_city || !mosque_state || !mosque_country) {
        return res.status(400).json({ detail: 'All mosque fields are required for admin registration' });
      }
      
      if (!req.files || !req.files.id_proof) {
        return res.status(400).json({ detail: 'ID proof is required for admin registration' });
      }
      
      const idProofBase64 = req.files.id_proof[0].buffer.toString('base64');
      const donationQrBase64 = req.files.donation_qr ? req.files.donation_qr[0].buffer.toString('base64') : null;
      
      // Create mosque
      mosqueId = generateId();
      const mosque = new Mosque({
        id: mosqueId,
        name: mosque_name,
        phone: mosque_phone,
        alternate_phone: mosque_alternate_phone,
        address: mosque_address,
        district: mosque_district,
        city: mosque_city,
        state: mosque_state,
        country: mosque_country,
        latitude: mosque_latitude ? parseFloat(mosque_latitude) : null,
        longitude: mosque_longitude ? parseFloat(mosque_longitude) : null,
        donation_qr_code: donationQrBase64
      });
      await mosque.save();
      
      // Create admin user
      const user = new User({
        id: generateId(),
        email,
        password_hash: passwordHash,
        role,
        mosque_id: mosqueId,
        id_proof: idProofBase64,
        status: 'pending'
      });
      await user.save();
      
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        mosque_id: user.mosque_id,
        status: user.status,
        created_at: user.created_at
      });
    } else {
      // Regular user
      const user = new User({
        id: generateId(),
        email,
        password_hash: passwordHash,
        role,
        status: 'approved'
      });
      await user.save();
      
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        mosque_id: user.mosque_id,
        status: user.status,
        created_at: user.created_at
      });
    }
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    if (user.role === 'admin' && user.status !== 'approved') {
      return res.status(403).json({ detail: 'Admin account pending approval' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      mosque_id: user.mosque_id,
      status: user.status,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
