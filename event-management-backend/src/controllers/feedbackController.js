import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;
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

export const getFeedbackForEvent = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
