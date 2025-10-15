import express from 'express';
const router = express.Router();
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, assignCoordinators, generateAttendanceCode, checkInWithCode, getAdminStats, getCoordinatorStats } from '../controllers/eventController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validateRequest.js';

// Public access to view events
router.get('/', getAllEvents);
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid event id'),
  validate,
  getEventById
);

// Admin create/update/delete
router.post('/', authMiddleware, roleMiddleware(['admin']), createEvent);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteEvent);

// Assign coordinators (admin only)
router.post('/:id/assign', authMiddleware, roleMiddleware(['admin']), assignCoordinators);

// Attendance QR code generate (admin or coordinator of this event)
router.post('/:id/attendance/code', authMiddleware, generateAttendanceCode);

// Check-in with code (any authenticated user)
router.post('/:id/attendance/check-in', authMiddleware, checkInWithCode);

// Stats
router.get('/stats/admin/summary', authMiddleware, roleMiddleware(['admin', 'superadmin']), getAdminStats);
router.get('/stats/coordinator/summary', authMiddleware, roleMiddleware(['coordinator']), getCoordinatorStats);

export default router;
