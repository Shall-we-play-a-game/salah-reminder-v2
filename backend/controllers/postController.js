import Post from '../models/Post.js';
import { generateId } from '../utils/helpers.js';

export const createPost = async (req, res) => {
  try {
    const { admin_id, mosque_id } = req.query;
    const { 
      title, 
      content, 
      scope, 
      city, 
      country, 
      event_start_date, 
      event_end_date 
    } = req.body;
    
    // Validate: content or image must be provided
    if (!content && !req.file) {
      return res.status(400).json({ detail: 'Either content or image must be provided' });
    }
    
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }
    
    const post = new Post({
      id: generateId(),
      mosque_id: scope === 'mosque' ? mosque_id : null,
      admin_id,
      title,
      content: content || null,
      image: imageBase64,
      scope: scope || 'mosque',
      city,
      country,
      event_start_date: event_start_date ? new Date(event_start_date) : null,
      event_end_date: event_end_date ? new Date(event_end_date) : null,
    });
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { mosque_id, status, scope, city, country, search, sortBy, sortOrder } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (scope) query.scope = scope;
    if (city) query.city = city;
    if (country) query.country = country;
    
    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // For mosque-level posts
    if (mosque_id) {
      query.$or = [
        { mosque_id },
        { scope: 'city', city: req.query.city_for_mosque },
        { scope: 'country', country: req.query.country_for_mosque }
      ];
    }
    
    // Build sort object
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.created_at = -1; // Default sort by newest first
    }
    
    const posts = await Post.find(query, { _id: 0, __v: 0 }).sort(sort);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' }, { _id: 0, __v: 0 }).sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }
    
    const post = await Post.findOneAndUpdate(
      { id: req.params.post_id },
      { status },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    res.json({ message: 'Post status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content, scope, city, country, event_start_date, event_end_date } = req.body;
    
    const updateData = {
      title,
      scope,
      city,
      country,
    };
    
    if (content !== undefined) updateData.content = content;
    if (event_start_date) updateData.event_start_date = new Date(event_start_date);
    if (event_end_date) updateData.event_end_date = new Date(event_end_date);
    
    if (req.file) {
      updateData.image = req.file.buffer.toString('base64');
    }
    
    const post = await Post.findOneAndUpdate(
      { id: req.params.post_id },
      updateData,
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ id: req.params.post_id });
    
    if (!post) {
      return res.status(404).json({ detail: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
