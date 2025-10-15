import mongoose from 'mongoose';


const eventSchema = new mongoose.Schema({
  eventID: { type: String, unique: true, default: function() { return this._id.toString(); } },
  name: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  time: { type: String },
  capacity: { type: Number },
  banner: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendanceCode: { type: String },
  attendanceCodeExpiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
