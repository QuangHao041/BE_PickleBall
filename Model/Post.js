const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   court_address: { type: String, required: true },
//   images: [String],
//   total_players: { type: Number, required: true },
//   court_type: { type: String, enum: ['covered', 'uncovered'], required: true },
//   players_needed: { type: Number, required: true },
//   skill_level: { type: String, required: true },
//   time: { type: Date, required: true },
//   cost: { type: Number, required: true },
//   contact_info: { type: String, required: true },
//   status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//   created_at: { type: Date, default: Date.now },
//   updated_at: { type: Date, default: Date.now },
//   info_players: [{
//     id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     name: { type: String, required: true },
//     contact: {
//       phone_number: { type: String, required: true },
//       facebook_link: { type: String, default: '' }
//     }
//   }]
// });
const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  court_address: { type: String, required: true },
  images: [String],
  total_players: { type: Number, required: true },
  court_type: { type: String, enum: ['covered', 'uncovered'], required: true },
  players_needed: { type: Number, required: true },
  skill_level: { type: String, required: true },
  time: { type: Date, required: true },
  cost: { type: Number, required: true },
  contact_info: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  applied_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Thêm dòng này
});


module.exports = mongoose.model('Post', postSchema);
