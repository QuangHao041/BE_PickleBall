const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  court_name: { type: String, required: true },
  location:{type:String,required: true },
  images: [String],
  total_players: { type: Number, required: true },
  court_type: { type: String, enum: ['Sân Có Mái Che', 'Sân không có mái che'], required: true },
  players_needed: { type: Number, required: true },
  skill_level: { type: String, required: true },
  play_date: { type: String, required: true }, 
  play_time: { type: String, required: true }, 
  cost: { type: Number, required: true },
  contact_info: { type: String},
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  applied_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]   
});

// Middleware cập nhật updated_at
postSchema.pre('save', function (next) {
  this.updated_at = Date.now(); // Cập nhật thời gian mỗi khi lưu
  next();
});

postSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: Date.now() }); // Cập nhật thời gian khi cập nhật
  next();
});

module.exports = mongoose.model('Post', postSchema);
