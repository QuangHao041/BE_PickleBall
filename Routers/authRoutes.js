const express = require('express');
const passport = require('passport');
const { register, login } = require('../Controller/authController');

const router = express.Router();

// Đăng ký và đăng nhập bằng thông tin người dùng
router.post('/register', register);
router.post('/login', login);

// // Facebook OAuth Routes
// router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful authentication, redirect home or send token.
//     res.redirect('/dashboard');
//   }
// );

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home or send token.
    res.redirect('/dashboard');
  }
);

module.exports = router;
