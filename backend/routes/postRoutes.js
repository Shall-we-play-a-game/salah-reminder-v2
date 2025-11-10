import express from 'express';
import { 
  createPost, 
  getAllPosts, 
  getPendingPosts, 
  updatePostStatus, 
  updatePost, 
  deletePost 
} from '../controllers/postController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('image'), createPost);
router.get('/', getAllPosts);
router.get('/pending', getPendingPosts);
router.patch('/:post_id/status', updatePostStatus);
router.patch('/:post_id', upload.single('image'), updatePost);
router.delete('/:post_id', deletePost);

export default router;
