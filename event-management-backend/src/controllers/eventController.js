import Event from '../models/Event.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, date, location, description, time, capacity, banner } = req.body;
    const creatorId = req.user?._id || undefined;
    const event = await Event.create({ name, date, location, description, time, capacity, banner, createdBy: creatorId });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updates = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign coordinators to an event
export const assignCoordinators = async (req, res) => {
  try {
    const { coordinatorIds } = req.body; // array of userIds
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { coordinators: { $each: coordinatorIds || [] } } },
      { new: true }
    ).populate('coordinators', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate an attendance QR code token
export const generateAttendanceCode = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // Only admin or assigned coordinator can generate
    const role = req.user?.role;
    const userId = req.user?._id?.toString();
    const isCoordinator = event.coordinators?.some(c => c.toString() === userId);
    if (!(['admin', 'superadmin'].includes(role) || isCoordinator)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const code = crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    event.attendanceCode = code;
    event.attendanceCodeExpiresAt = expiresAt;
    await event.save();
    res.json({ code, expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check-in using attendance code
export const checkInWithCode = async (req, res) => {
  try {
    const { code } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.attendanceCode || event.attendanceCode !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    if (!event.attendanceCodeExpiresAt || event.attendanceCodeExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Code expired' });
    }
    const userId = req.user._id;
    const already = event.attendance?.some(u => u.toString() === userId.toString());
    if (already) return res.json({ message: 'Already checked in' });
    event.attendance.push(userId);
    await event.save();
    res.json({ message: 'Checked in' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Basic stats for admin and coordinator
export const getAdminStats = async (_req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalAttendance = await Event.aggregate([
      { $project: { count: { $size: { $ifNull: ['$attendance', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    res.json({ events: totalEvents, attendance: totalAttendance[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCoordinatorStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ coordinators: userId });
    const attendance = events.reduce((sum, ev) => sum + (ev.attendance?.length || 0), 0);
    res.json({ assignedEvents: events.length, attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
