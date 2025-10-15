import express from 'express';
import { getAllUsers, deleteUser, getAllEvents, deleteEvent, getAllFeedback, createSuperAdmin, bulkCreateCoordinators, assignEventToCoordinator } from '../controllers/superadminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require superadmin
router.get('/users', authMiddleware, roleMiddleware(['superadmin']), getAllUsers);
router.delete('/users/:id', authMiddleware, roleMiddleware(['superadmin']), deleteUser);
router.get('/events', authMiddleware, roleMiddleware(['superadmin']), getAllEvents);
router.delete('/events/:id', authMiddleware, roleMiddleware(['superadmin']), deleteEvent);
router.get('/feedback', authMiddleware, roleMiddleware(['superadmin']), getAllFeedback);

// Create superadmin
router.post('/bootstrap/superadmin', authMiddleware, roleMiddleware(['superadmin']), createSuperAdmin);

// Bulk create coordinators
router.post('/coordinators/bulk', authMiddleware, roleMiddleware(['superadmin']), bulkCreateCoordinators);

// Assign event to coordinator
router.post('/events/:eventId/assign', authMiddleware, roleMiddleware(['superadmin']), assignEventToCoordinator);

export default router;