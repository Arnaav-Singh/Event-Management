import User from '../models/User.js';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete any user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete any event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').populate('event', 'title');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a superadmin user
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: 'superadmin' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk create coordinators from provided array
export const bulkCreateCoordinators = async (req, res) => {
  try {
    const { coordinators } = req.body; // [{name,email,password}]
    if (!Array.isArray(coordinators) || coordinators.length === 0) {
      return res.status(400).json({ message: 'No coordinators provided' });
    }
    const docs = coordinators.map(c => ({ ...c, role: 'coordinator' }));
    const result = await User.insertMany(docs, { ordered: false });
    res.status(201).json({ created: result.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign an event to a coordinator
export const assignEventToCoordinator = async (req, res) => {
  try {
    const { coordinatorId } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { coordinators: new mongoose.Types.ObjectId(coordinatorId) } },
      { new: true }
    ).populate('coordinators', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};