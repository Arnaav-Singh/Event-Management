import express from 'express';
const router = express.Router();
import { getUsers, createUser, deleteUser, getAllEvents } from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

router.get('/users', authMiddleware, roleMiddleware(['admin']), getUsers);
router.post('/users', authMiddleware, roleMiddleware(['admin']), createUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.get('/events', authMiddleware, roleMiddleware(['admin']), getAllEvents);

export default router;
