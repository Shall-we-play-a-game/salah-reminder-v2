import express from 'express';
import { 
  getPendingUsers, 
  getUserIdProof, 
  updateUserStatus, 
  addFavoriteMosque, 
  removeFavoriteMosque, 
  getFavoriteMosques 
} from '../controllers/userController.js';

const router = express.Router();

router.get('/pending', getPendingUsers);
router.get('/:user_id/id-proof', getUserIdProof);
router.patch('/:user_id/status', updateUserStatus);
router.post('/:user_id/favorites/:mosque_id', addFavoriteMosque);
router.delete('/:user_id/favorites/:mosque_id', removeFavoriteMosque);
router.get('/:user_id/favorites', getFavoriteMosques);

export default router;
