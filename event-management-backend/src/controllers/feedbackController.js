// Feedback endpoints letting attendees rate events they joined.
import Feedback from '../models/Feedback.js';
import Event from '../models/Event.js';

// Persist a feedback entry after confirming the attendee was present.
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user._id.toString();
    const hasAttended = (event.attendance || []).some((att) => att.toString() === userId);
    if (!hasAttended) {
      return res.status(403).json({ message: 'Feedback allowed after attending the event' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      event: req.params.eventId,
      rating,
      comments,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retrieve feedback responses for coordinator or dean review.
export const getFeedbackForEvent = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
