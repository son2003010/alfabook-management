import express from 'express';
import { validateChatRequest  } from '../middleware/validateRequest.js';

import { chatWithGemini } from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', validateChatRequest, chatWithGemini);


export default router;
