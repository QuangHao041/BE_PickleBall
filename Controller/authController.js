const User = require('../Model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// exports.register = async (req, res) => {
//   try {
//     const { username, phone, password, role } = req.body;
//     const user = new User({ username, phone, password, role });
//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials User' });
//     }
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials password' });
//     }
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );
//     res.json({ token });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


exports.register = async (req, res) => {
  try {
    const { username, phone, email, password, role = 'player' } = req.body;

    // Kiểm tra vai trò hợp lệ
    const validRoles = ['player', 'court', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Tạo một đối tượng người dùng mới mà không kiểm tra tính duy nhất
    const user = new User({ username, phone, email, password, role });

    // Lưu người dùng vào cơ sở dữ liệu
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials User' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials password' });
    }
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
    res.status(400).json({ error: error.message });
  }
};

// exports.login = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     // Tìm user dựa trên email hoặc phone
//     const user = await User.findOne({ 
//       $or: [{ email: identifier }, { phone: identifier }] 
//     });

//     if (!user) {
//       return res.status(400).json({ error: 'Invalid email/phone or password' });
//     }

//     // So sánh mật khẩu
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid email/phone or password' });
//     }

//     // Tạo token
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     // Trả về thông tin user và token
//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         id: user._id,
//         username: user.username,
//         phone: user.phone,
//         email: user.email,
//         role: user.role
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'An error occurred during login' });
//   }
// };