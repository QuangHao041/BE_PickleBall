const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certification: String,
  experience: String,
  specialties: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coach', coachSchema);