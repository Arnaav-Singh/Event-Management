import express from 'express';
const router = express.Router();
import { getAllEvents, getEventById } from '../controllers/eventController.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validateRequest.js';

// Public access to view events
router.get('/', getAllEvents);
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid event id'),
  validate,
  getEventById
);

export default router;
