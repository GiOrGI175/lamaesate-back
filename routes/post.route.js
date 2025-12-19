import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  addPost,
  deletePost,
  getPost,
  getPosts,
  resetPosts,
  seedPosts,
  updatePost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/seed', verifyToken, seedPosts);
router.delete('/reset', verifyToken, resetPosts);

router.get('/:id', getPost);
router.post('/', verifyToken, addPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

export default router;
