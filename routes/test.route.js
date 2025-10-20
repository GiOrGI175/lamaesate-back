import express from 'express';
import {
  shuldbeAdmin,
  shuldbeLoggedIn,
} from '../controllers/test.controller.js';

const router = express.Router();

router.get('/should-be-logged-in', shuldbeLoggedIn);
router.get('/should-be-logged-in', shuldbeAdmin);

export default router;
