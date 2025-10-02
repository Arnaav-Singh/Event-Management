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
