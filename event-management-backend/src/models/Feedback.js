import mongoose from 'mongoose';


const feedbackSchema = new mongoose.Schema({
  feedbackID: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
