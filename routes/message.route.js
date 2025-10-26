import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { addNewMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/', verifyToken, addNewMessage);

export default router;
