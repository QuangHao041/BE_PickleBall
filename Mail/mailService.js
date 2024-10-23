const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (email, token) => {
  const verificationLink = `https://bepickleball.vercel.app/api/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Xác thực tài khoản PickleBall',
    html: `<p>Chào bạn,</p>
           <p>Vui lòng nhấp vào liên kết dưới đây để xác thực tài khoản của bạn:</p>
           <a href="${verificationLink}">Xác thực tài khoản</a>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
