const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  availability: [{
    day: { type: String },
    time_slots: [String]  
  }],
  price_per_hour: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Court', courtSchema);
