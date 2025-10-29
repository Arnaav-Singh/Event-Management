import express from 'express';
const router = express.Router();
import { registerForEvent, getMyEvents, markAttendance, listAttendance } from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const deanRoles = ['dean', 'superadmin'];

router.post('/events/:id/register', authMiddleware, roleMiddleware(['student']), registerForEvent);
router.get('/my-events', authMiddleware, roleMiddleware(['student']), getMyEvents);
router.post('/events/:id/attendance', authMiddleware, roleMiddleware(['student']), markAttendance);
router.get('/events/:id/attendance', authMiddleware, roleMiddleware([...deanRoles, 'coordinator']), listAttendance);

export default router;
