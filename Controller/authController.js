const User = require('../Model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản mới
exports.register = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;

    // Kiểm tra vai trò hợp lệ hoặc gán vai trò mặc định là 'player'
    const validRoles = ['player', 'court', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'player';

    // Kiểm tra người dùng đã tồn tại chưa (bằng email hoặc số điện thoại)
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Tạo một người dùng mới
    const newUser = new User({
      username,
      phone,
      email,
      password,
      role: userRole
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // So sánh mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Tạo token cho người dùng
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Lấy userId từ JWT middleware

    const user = await User.findById(userId).select('-password -provider'); // Không lấy mật khẩu và provider

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      profile: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'An error occurred while fetching profile' });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // Lấy userId từ JWT middleware
    const { name, avatar, skill_level, bio, phone_number, facebook_link } = req.body;

    // Tìm người dùng và cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'profile.name': name,
        'profile.avatar': avatar,
        'profile.skill_level': skill_level,
        'profile.bio': bio,
        'profile.phone_number': phone_number,
        'profile.facebook_link': facebook_link,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedUser.profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'An error occurred while updating profile' });
  }
};
