import Event from '../models/Event.js';

export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    event.attendees.push(req.user._id);
    await event.save();
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const userId = req.user._id.toString();
    if (!event.attendees.map(a => a.toString()).includes(userId)) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }
    if (!event.attendance) event.attendance = [];
    if (event.attendance.map(a => a.toString()).includes(userId)) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }
    event.attendance.push(req.user._id);
    await event.save();
    res.json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendance', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event.attendance || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
