const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Coach's name
  rating: { type: Number, required: true },  // Coach's skill level rating
  price_per_session: { type: Number, required: true },  // Price per session
  contact_info: { 
    phone: { type: String, required: true },  // Phone contact number
    facebook: { type: String },  // Facebook URL
    zalo: { type: String },  // Zalo URL or phone number
  },
  profile_image_url: { type: String },  // URL for the coach's profile image
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coach', coachSchema);
