import express from 'express';
const router = express.Router();
import { registerForEvent, getMyEvents, markAttendance, listAttendance } from '../controllers/attenderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

router.post('/events/:id/register', authMiddleware, roleMiddleware(['attender']), registerForEvent);
router.get('/my-events', authMiddleware, roleMiddleware(['attender']), getMyEvents);
router.post('/events/:id/attendance', authMiddleware, roleMiddleware(['attender']), markAttendance);
router.get('/events/:id/attendance', authMiddleware, roleMiddleware(['admin','coordinator']), listAttendance);

export default router;
