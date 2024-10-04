const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Model/User');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Không có token, từ chối truy cập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({ error: 'Xác thực thất bại' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
};

const authenticateAdmin = async (req, res, next) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ error: 'Không có quyền truy cập' });
      }
    });
  } catch (error) {
    console.error('Lỗi xác thực admin:', error);
    res.status(403).json({ error: 'Token không hợp lệ hoặc xác thực thất bại' });
  }
};

module.exports = { authenticateUser, authenticateAdmin, checkRole };