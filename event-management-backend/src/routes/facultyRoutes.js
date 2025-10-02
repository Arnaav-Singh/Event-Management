import express from 'express';
const router = express.Router();
import { getAllFaculty, inviteFaculty, deleteFaculty } from '../controllers/facultyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

// Only coordinator and admin can manage faculty
router.get('/', authMiddleware, roleMiddleware(['coordinator', 'admin']), getAllFaculty);
router.post('/invite', authMiddleware, roleMiddleware(['coordinator', 'admin']), inviteFaculty);
router.delete('/:id', authMiddleware, roleMiddleware(['coordinator', 'admin']), deleteFaculty);

export default router;
