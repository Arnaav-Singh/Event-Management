import express from 'express';
const router = express.Router();
import { submitFeedback, getFeedbackForEvent } from '../controllers/feedbackController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.post('/:eventId', authMiddleware, submitFeedback);
router.get('/:eventId', authMiddleware, getFeedbackForEvent);

export default router;
