const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  description: { type: String, required: true },  
  price_per_session: { type: Number, required: true },  
  contact_info: { 
    phone: { type: String, required: true },  
    facebook: { type: String }
  },
  images: [{ type: String }], 
  address:{type:String,required: true }, 
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coach', coachSchema);
