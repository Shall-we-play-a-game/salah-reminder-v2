import User from '../models/User.js';
import Mosque from '../models/Mosque.js';

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'admin', status: 'pending' }, { _id: 0, __v: 0, password_hash: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserIdProof = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    res.json({ id_proof: user.id_proof });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }
    
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { status },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFavoriteMosque = async (req, res) => {
  try {
    const mosque = await Mosque.findOne({ id: req.params.mosque_id });
    if (!mosque) {
      return res.status(404).json({ detail: 'Mosque not found' });
    }
    
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { $addToSet: { favorite_mosques: req.params.mosque_id } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Mosque added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFavoriteMosque = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.user_id },
      { $pull: { favorite_mosques: req.params.mosque_id } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json({ message: 'Mosque removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFavoriteMosques = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    const mosques = await Mosque.find({ id: { $in: user.favorite_mosques } }, { _id: 0, __v: 0 });
    res.json(mosques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
