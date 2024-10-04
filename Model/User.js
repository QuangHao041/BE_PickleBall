const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['player', 'court', 'admin'], default: 'player' },
  profile: {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    skill_level: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone_number: { type: String, default: '' },
    facebook_link: { type: String, default: '' }
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
