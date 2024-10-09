// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Để lưu mật khẩu khi đăng ký
  role: { type: String, enum: ['player', 'court', 'admin'], default: 'player' },
  provider: { type: String, default: 'local' },
  googleId: { type: String, unique: true, sparse: true }, 
  profile: {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    skill_level: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone_number: { type: String, default: '' },
    facebook_link: { type: String, default: '' }
  }
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) { // Chỉ mã hóa nếu mật khẩu đã bị thay đổi hoặc mới
    try {
      const salt = await bcrypt.genSalt(10); // Tạo salt với độ khó 10
      this.password = await bcrypt.hash(this.password, salt); // Mã hóa mật khẩu
      console.log('Hashed password saved:', this.password); // Ghi lại mật khẩu đã mã hóa
    } catch (error) {
      return next(error); // Nếu có lỗi trong quá trình mã hóa, dừng lại
    }
  }
  next(); // Tiếp tục lưu người dùng vào cơ sở dữ liệu
});


// Kiểm tra mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('Candidate Password:', candidatePassword); // Ghi lại mật khẩu nhập vào
    console.log('Stored Hashed Password:', this.password); // Ghi lại mật khẩu đã mã hóa từ DB
    return await bcrypt.compare(candidatePassword, this.password); // So sánh mật khẩu
  } catch (error) {
    throw new Error('Password comparison failed'); // Nếu so sánh thất bại, trả về lỗi
  }
};


module.exports = mongoose.model('User', userSchema);
