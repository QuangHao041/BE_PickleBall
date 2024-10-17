const express = require('express');
const passport = require('passport');
const { register, login, getProfile, updateProfile, changePassword, forgotPassword} = require('../Controller/authController');
const { authenticateUser} = require('../Middleware/authMiddleware');
const upload = require('../Controller/upload');
const router = express.Router();

// Đăng ký và đăng nhập bằng thông tin người dùng
router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);

// Route lấy thông tin profile
router.get('/profile', authenticateUser, getProfile);
router.post('/change-password', authenticateUser, changePassword);
// Route cập nhật thông tin profile
router.put('/profile/update', authenticateUser, upload.array('avatar', 1), updateProfile);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home or send token.
    res.redirect('/');
  }
);

// // Facebook OAuth Routes
// router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful authentication, redirect home or send token.
//     res.redirect('/dashboard');
//   }
// );



module.exports = router;
