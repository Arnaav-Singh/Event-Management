import express from 'express';
const router = express.Router();
import { createEvent, updateEvent, deleteEvent } from '../controllers/coordinatorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

router.post('/events', authMiddleware, roleMiddleware(['coordinator']), createEvent);
router.put('/events/:id', authMiddleware, roleMiddleware(['coordinator']), updateEvent);
router.delete('/events/:id', authMiddleware, roleMiddleware(['coordinator']), deleteEvent);

export default router;
